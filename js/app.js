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

let partnerPollInterval = null;

// ── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
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

  if (!room.partner_id) {
    ROOM.renderWaiting(room.invite_code);
    showScreen('room-screen');
    return;
  }

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

  if (!partnerPrefs) {
    showScreen('waiting-screen');
    startPartnerQuizPoll();
    return;
  }

  await enterMainApp();
}

async function enterMainApp() {
  // Load votes I've already cast
  const { data: votes } = await STATE.db
    .from('votes')
    .select('name, vote')
    .eq('room_id', STATE.room.id)
    .eq('user_id', STATE.user.id);

  if (votes) {
    votes.forEach(v => { STATE.myVotes[v.name] = v.vote; });
  }

  // Add names the AI recommender found (for anyone) to the names list
  const { data: aiNames, error: aiNamesError } = await STATE.db
    .from('ai_names')
    .select('name, gender, origin, style, meaning, syllables');
  if (aiNamesError) console.warn('Could not load AI-suggested names:', aiNamesError);
  else RECOMMEND.addToNamesList(aiNames || []);

  // Build deck
  STATE.deck = DECK.build(STATE.myPrefs, STATE.partnerPrefs);
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

  // Show main app
  document.getElementById('bottom-nav').classList.add('visible');
  SWIPE.render();
  SHORTLIST.render();
  PROFILE.populate();
  showMainScreen('swipe-screen');
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

// ── PARTNER QUIZ POLLING ──────────────────────────────────────────────────────
function startPartnerQuizPoll() {
  clearInterval(partnerPollInterval);
  partnerPollInterval = setInterval(async () => {
    const { data: allPrefs } = await STATE.db
      .from('preferences')
      .select('*')
      .eq('room_id', STATE.room.id);

    const partnerPrefs = allPrefs ? allPrefs.find(p => p.user_id !== STATE.user.id) : null;
    if (partnerPrefs) {
      clearInterval(partnerPollInterval);
      STATE.partnerPrefs = partnerPrefs;
      await enterMainApp();
    }
  }, 8000);
}

// ── PROFILE OBJECT ───────────────────────────────────────────────────────────
const PROFILE = {
  populate() {
    const name  = STATE.profile ? STATE.profile.display_name : STATE.user.email;
    const email = STATE.user.email;
    document.getElementById('profile-name').textContent  = name;
    document.getElementById('profile-email').textContent = email;
    document.getElementById('profile-code').textContent  =
      STATE.room ? STATE.room.invite_code : '—';
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
