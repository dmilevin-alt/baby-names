// ── GLOBAL STATE ─────────────────────────────────────────────────────────────
// All JS files share this object since they're loaded in the same page.
const STATE = {
  db:          null,   // Supabase client
  user:        null,   // auth.users row
  profile:     null,   // profiles row
  room:        null,   // rooms row
  myPrefs:     null,   // preferences row (mine)
  partnerPrefs:null,   // preferences row (partner)
  deck:        [],     // array of name objects, scored + sorted
  deckIndex:   0,      // current swipe position
  reviewMode:  false,  // reviewing previously passed names
  myVotes:     {},     // { name: 'love'|'maybe'|'pass' }
  shortlist:   [],     // shortlist rows
  matchQueue:  [],     // new match names to celebrate
};


// ── APP VERSION ──────────────────────────────────────────────────────────────
// Must match version.txt and the ?v= on every file in app.html and index.html
// (tools/bump-version.sh updates all of them).
const APP_VERSION = '2026-10-06.2';

// Phones, and especially home-screen apps, can keep running cached old files after an
// update. Check the live version (never cached) and reload onto it if this copy is old.
async function ensureLatestVersion() {
  try {
    const res = await fetch('./version.txt?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return false;
    const live = (await res.text()).trim();
    if (!live || live === APP_VERSION) return false;
    const tried = sessionStorage.getItem('reloadedFor');
    if (tried === live) return false;          // already reloaded once for this version
    sessionStorage.setItem('reloadedFor', live);
    location.replace('./app.html?v=' + encodeURIComponent(live));
    return true;
  } catch {
    return false;                               // offline: carry on with this copy
  }
}

// ── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (await ensureLatestVersion()) return;
  STATE.db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: { session } } = await STATE.db.auth.getSession();
  if (!session) {
    window.location.href = './index.html';
    return;
  }

  STATE.user = session.user;
  await boot();

  // Keep session alive
  STATE.db.auth.onAuthStateChange((event, newSession) => {
    if (!newSession) window.location.href = './index.html';
  });
});

async function boot() {
  showScreen('loading-screen');

  // Load profile
  const { data: profile } = await STATE.db
    .from('profiles')
    .select('*')
    .eq('id', STATE.user.id)
    .single();
  STATE.profile = profile;

  // Check room membership
  const { data: rooms } = await STATE.db
    .from('rooms')
    .select('*')
    .or(`created_by.eq.${STATE.user.id},partner_id.eq.${STATE.user.id}`)
    .limit(1);

  const room = rooms && rooms[0];

  if (!room) {
    ROOM.renderCreate();
    showScreen('room-screen');
    return;
  }

  STATE.room = room;

  // Load preferences for both users
  const { data: allPrefs } = await STATE.db
    .from('preferences')
    .select('*')
    .eq('room_id', room.id);

  const myPrefs      = allPrefs ? allPrefs.find(p => p.user_id === STATE.user.id)      : null;
  const partnerPrefs = allPrefs ? allPrefs.find(p => p.user_id !== STATE.user.id)      : null;

  STATE.myPrefs      = myPrefs;
  STATE.partnerPrefs = partnerPrefs;

  if (!myPrefs) {
    QUIZ.init();
    showScreen('quiz-screen');
    return;
  }

  // You can swipe before your partner joins or finishes their quiz

  await enterMainApp();
}

// Every vote I've cast. The API returns at most 1,000 rows per request, so page
// through them; otherwise votes past the first 1,000 are dropped and those names
// come back in the deck.
async function loadAllVotes() {
  const PAGE = 1000;
  const votes = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await STATE.db
      .from('votes')
      .select('name, vote')
      .eq('room_id', STATE.room.id)
      .eq('user_id', STATE.user.id)
      .order('name')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    votes.push(...(data || []));
    if (!data || data.length < PAGE) return votes;
  }
}

async function enterMainApp() {
  // Votes that couldn't be saved last time go first, so nothing rated comes back
  await VOTE_QUEUE.flush();

  let votes;
  try {
    votes = await loadAllVotes();
  } catch (err) {
    // Never build a deck without the votes: every rated name would come back
    console.error('Could not load votes:', err);
    showScreen('loading-screen');
    document.querySelector('#loading-screen p').innerHTML =
      'Could not load your votes. <a href="#" onclick="location.reload(); return false;">Try again</a>';
    return;
  }

  votes.forEach(v => { STATE.myVotes[v.name] = v.vote; });
  // A vote on a spelling that was merged into another counts for the kept spelling
  votes.forEach(v => {
    const kept = MERGED_SPELLINGS[v.name];
    if (kept && !STATE.myVotes[kept]) STATE.myVotes[kept] = v.vote;
  });
  // Votes still waiting to be saved count too
  for (const v of VOTE_QUEUE.pending()) STATE.myVotes[v.name] = v.vote;

  // Add names the AI recommender found (for anyone) to the names list
  const { data: aiNames, error: aiNamesError } = await STATE.db
    .from('ai_names')
    .select('name, gender, origin, style, meaning, syllables');
  if (aiNamesError) console.warn('Could not load AI-suggested names:', aiNamesError);
  else RECOMMEND.addToNamesList(aiNames || []);

  // Build deck
  STATE.deck = DECK.build(STATE.myPrefs, STATE.partnerPrefs || STATE.myPrefs);
  STATE.deckIndex = STATE.deck.findIndex(name => !STATE.myVotes[name.name]);
  if (STATE.deckIndex === -1) STATE.deckIndex = STATE.deck.length;

  // Load shortlist, and put custom names your partner added into your deck
  const { data: sl } = await STATE.db
    .from('shortlist')
    .select('*')
    .eq('room_id', STATE.room.id)
    .order('created_at', { ascending: false });
  STATE.shortlist = sl || [];
  await SHORTLIST.syncCustomNames();
  startShortlistPoll();
  // Votes you both cast before you were paired can already be matches
  if (STATE.room.partner_id) await checkForNewMatches();
  PARTNER.watch();

  // Show main app
  document.getElementById('bottom-nav').classList.add('visible');
  SWIPE.render();
  SHORTLIST.render();
  PROFILE.populate();
  showMainScreen('swipe-screen');
  FAMILY.maybePrompt();
}

// ── SAVING VOTES ─────────────────────────────────────────────────────────────
// Save a vote, retrying on failure. A vote that still can't be saved is kept on
// this device and sent next time, so a name you rated never comes back.
const VOTE_QUEUE = {
  key() { return `pendingVotes:${STATE.room?.id}:${STATE.user?.id}`; },

  pending() {
    try { return JSON.parse(localStorage.getItem(this.key()) || '[]'); } catch { return []; }
  },

  _write(list) {
    try { localStorage.setItem(this.key(), JSON.stringify(list)); } catch { /* storage unavailable */ }
  },

  add(name, vote) {
    const list = this.pending().filter(v => v.name !== name);
    list.push({ name, vote });
    this._write(list);
  },

  // Returns true once every queued vote is saved
  async flush() {
    const list = this.pending();
    if (list.length === 0) return true;
    const { error } = await STATE.db.from('votes').upsert(
      list.map(v => ({ room_id: STATE.room.id, user_id: STATE.user.id, name: v.name, vote: v.vote })),
      { onConflict: 'room_id,user_id,name' });
    if (error) { console.warn('Queued votes still not saved:', error); return false; }
    this._write([]);
    return true;
  },
};

async function persistVote(name, vote) {
  const row = { room_id: STATE.room.id, user_id: STATE.user.id, name, vote };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { error } = await STATE.db.from('votes').upsert(row, { onConflict: 'room_id,user_id,name' });
      if (!error) {
        if (VOTE_QUEUE.pending().length) VOTE_QUEUE.flush();   // catch up on earlier failures
        return true;
      }
      console.warn(`Vote save failed (attempt ${attempt + 1}):`, error);
    } catch (err) {
      console.warn(`Vote save failed (attempt ${attempt + 1}):`, err);
    }
    await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
  }
  VOTE_QUEUE.add(name, vote);
  showToast('Couldn\u2019t reach the server. Your vote is saved on this phone and will sync.', 3500);
  return false;
}

// ── SCREEN HELPERS ────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function showMainScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-screen="${id}"]`);
  if (btn) btn.classList.add('active');

  if (id === 'shortlist-screen') SHORTLIST.render();
  if (id === 'profile-screen')   PROFILE.populate();
  if (id === 'browse-screen')    BROWSE.render();
}

// ── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg, duration = 2400) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('visible'), duration);
}

// ── MATCH CELEBRATION ────────────────────────────────────────────────────────
function celebrateMatch(nameObj) {
  const overlay = document.getElementById('match-overlay');
  document.getElementById('match-name').textContent = nameObj.name;
  document.getElementById('match-subtitle').textContent =
    nameObj.meaning ? `"${nameObj.meaning}"` : '';
  overlay.classList.add('visible');
  spawnConfetti();
}

function closeMatch() {
  document.getElementById('match-overlay').classList.remove('visible');
  if (STATE.matchQueue.length > 0) {
    setTimeout(() => celebrateMatch(STATE.matchQueue.shift()), 400);
  }
}

function spawnConfetti() {
  const colors = ['#E8705A','#F4A261','#52B788','#A8DADC','#F1FAEE','#FFD166'];
  for (let i = 0; i < 40; i++) {
    const div = document.createElement('div');
    div.className = 'confetti-piece';
    div.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -14px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1.8 + Math.random() * 1.2}s;
      animation-delay: ${Math.random() * .5}s;
      transform: rotate(${Math.random() * 360}deg);
      width: ${6 + Math.random() * 8}px;
      height: ${8 + Math.random() * 8}px;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  }
}

// ── SHORTLIST POLLING ─────────────────────────────────────────────────────────
// Picks up custom names and matches your partner adds while you're in the app
let shortlistPollInterval = null;
function startShortlistPoll() {
  clearInterval(shortlistPollInterval);
  shortlistPollInterval = setInterval(async () => {
    const { data, error } = await STATE.db
      .from('shortlist')
      .select('*')
      .eq('room_id', STATE.room.id)
      .order('created_at', { ascending: false });
    if (error || !data) return;

    const key = list => list.map(s => `${s.id}:${s.is_custom}`).sort().join(',');
    if (key(data) === key(STATE.shortlist)) return;

    STATE.shortlist = data;
    await SHORTLIST.syncCustomNames();
    SWIPE.updateProgress();

    // Don't redraw over an open note editor or re-run the AI picks
    if (SHORTLIST.view !== 'foryou' && !document.querySelector('.shortlist-item.open')) {
      SHORTLIST.render();
    }
  }, 30000);
}

// ── PARTNER STATUS ────────────────────────────────────────────────────────────
// Until your partner has joined and done their quiz, check in now and then
let partnerWatchInterval = null;
const PARTNER = {
  watch() {
    clearInterval(partnerWatchInterval);
    this.renderBanner();
    if (STATE.room.partner_id && STATE.partnerPrefs) return;
    partnerWatchInterval = setInterval(() => this.check(), 15000);
  },

  async check() {
    if (!STATE.room.partner_id) {
      const { data: room } = await STATE.db.from('rooms').select('*').eq('id', STATE.room.id).single();
      if (!room?.partner_id) return;
      STATE.room = room;
      showToast('🎉 Your partner joined!', 3200);
      this.renderBanner();
      await checkForNewMatches();
    }
    const { data: prefs } = await STATE.db.from('preferences').select('*')
      .eq('room_id', STATE.room.id).neq('user_id', STATE.user.id).maybeSingle();
    if (prefs) {
      STATE.partnerPrefs = prefs;
      clearInterval(partnerWatchInterval);
    }
  },

  renderBanner() {
    const el = document.getElementById('invite-banner');
    if (!el) return;
    el.hidden = Boolean(STATE.room.partner_id);
    if (el.hidden) return;
    const code = escapeHtml(STATE.room.invite_code);
    el.innerHTML = `
      <div class="invite-banner-text">
        <b>Swiping solo for now</b>
        <span>Invite your partner with code <span class="invite-banner-code">${code}</span></span>
      </div>
      <button class="invite-banner-btn" onclick="PROFILE.shareCode()">Share</button>`;
  },
};

// ── PROFILE OBJECT ───────────────────────────────────────────────────────────
const PROFILE = {
  populate() {
    const name  = STATE.profile ? STATE.profile.display_name : STATE.user.email;
    const email = STATE.user.email;
    document.getElementById('profile-name').textContent  = name;
    document.getElementById('profile-email').textContent = email;
    document.getElementById('profile-code').textContent  =
      STATE.room ? STATE.room.invite_code : '—';
    document.getElementById('profile-family').textContent = FAMILY.summary();
    document.getElementById('profile-version').textContent = `App version ${APP_VERSION}`;
  },

  shareCode() {
    const code = STATE.room ? STATE.room.invite_code : null;
    if (!code) return;
    if (navigator.share) {
      navigator.share({ title: 'Join my Baby Names room', text: `Use code ${code} to join my Baby Names room!` })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(code).then(() => showToast('Code copied: ' + code));
    }
  },

  async retakeQuiz() {
    if (!confirm('Redo your quiz? Your previous answers will be replaced.')) return;
    await STATE.db
      .from('preferences')
      .delete()
      .eq('room_id', STATE.room.id)
      .eq('user_id', STATE.user.id);
    STATE.myPrefs = null;
    QUIZ.init();
    showScreen('quiz-screen');
  },

  async logout() {
    await STATE.db.auth.signOut();
    window.location.href = './index.html';
  }
};
