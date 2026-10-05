// ── BROWSE & NAME DETAILS ─────────────────────────────────────────────────────

// Lowercase and strip accents so "lea" finds "Léa"
function foldName(str) {
  return String(str || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function nicknamesFor(nameObj) {
  return NICKNAMES[nameObj?.name] || [];
}

// ── HEAR THE NAME ─────────────────────────────────────────────────────────────
// Uses the browser's built-in speech. Names from these origins use a voice in
// that language when the device has one; everything else uses the default voice.
const NAME_AUDIO = {
  LANGS: { french: 'fr', spanish: 'es', italian: 'it', german: 'de', dutch: 'nl',
           polish: 'pl', scandinavian: 'sv' },

  supported() {
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  },

  button(nameStr) {
    if (!this.supported()) return '';
    const name = escapeHtml(nameStr);
    return `<button class="hear-btn" data-name="${name}" onclick="NAME_AUDIO.speak(this.dataset.name, event)"
      onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()"
      title="Hear the name" aria-label="Hear ${name}">🔊</button>`;
  },

  speak(nameStr, event) {
    event?.stopPropagation();
    if (!this.supported()) return;
    const key = nameStr.toLowerCase();
    const n = NAMES.find(item => item.name.toLowerCase() === key);
    const lang = this.LANGS[(n?.origin || [])[0]];
    const voice = lang && speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(lang));

    const utterance = new SpeechSynthesisUtterance(nameStr);
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    utterance.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  },
};
// Some browsers load their voice list in the background
if (NAME_AUDIO.supported()) speechSynthesis.getVoices();

const VOTE_LABELS = { love: '❤️ Loved', maybe: '🤔 Maybe', pass: '✕ Passed' };
const GENDER_LABELS = { girl: 'Girl', boy: 'Boy', either: 'Unisex' };

const BROWSE = {
  query:   '',
  gender:  'all',   // all | girl | boy | either
  vote:    'all',   // all | unrated | love | maybe | pass
  limit:   60,
  PAGE:    60,

  render() {
    const list = document.getElementById('browse-list');
    if (!list) return;

    document.querySelectorAll('#browse-gender .browse-chip').forEach(chip =>
      chip.classList.toggle('active', chip.dataset.value === this.gender));
    document.querySelectorAll('#browse-vote .browse-chip').forEach(chip =>
      chip.classList.toggle('active', chip.dataset.value === this.vote));

    const results = this._results();
    const shown   = results.slice(0, this.limit);
    const countEl = document.getElementById('browse-count');
    if (countEl) countEl.textContent = results.length === 1 ? '1 name' : `${results.length} names`;

    if (results.length === 0) {
      list.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">🔍</div>
          <h3>No names found</h3>
          <p>Try a different spelling or clear the filters.</p>
        </div>`;
      return;
    }

    list.innerHTML = shown.map(r => this._renderRow(r)).join('') +
      (results.length > shown.length
        ? `<button class="btn btn-secondary browse-more" onclick="BROWSE.showMore()">
             Show more (${results.length - shown.length} left)
           </button>`
        : '');
  },

  // Matching names, best matches first: name starts with the query, then
  // name contains it, then a nickname matches it
  _results() {
    const q = foldName(this.query.trim());
    const out = [];
    for (const n of NAMES) {
      if (this.gender !== 'all' && n.gender !== this.gender &&
          !(this.gender !== 'either' && n.gender === 'either')) continue;
      const vote = STATE.myVotes[n.name];
      if (this.vote === 'unrated' ? vote : this.vote !== 'all' && vote !== this.vote) continue;

      if (!q) { out.push({ n, rank: 0 }); continue; }
      const folded = foldName(n.name);
      if (folded.startsWith(q))      out.push({ n, rank: 0 });
      else if (folded.includes(q))   out.push({ n, rank: 1 });
      else {
        const nick = nicknamesFor(n).find(k => foldName(k).startsWith(q));
        if (nick) out.push({ n, rank: 2, nick });
      }
    }
    return out.sort((a, b) => a.rank - b.rank || a.n.name.localeCompare(b.n.name));
  },

  _renderRow({ n, nick }) {
    const vote   = STATE.myVotes[n.name];
    const origin = (n.origin || []).map(capitalize).join(' · ');
    const sub    = [GENDER_LABELS[n.gender], origin].filter(Boolean).join(' · ');
    return `
      <button class="browse-row" data-name="${escapeHtml(n.name)}"
        onclick="NAME_DETAILS.open(this.dataset.name)">
        <div class="browse-row-main">
          <div class="browse-row-name">${escapeHtml(n.name)}</div>
          <div class="browse-row-sub">${escapeHtml(sub)}${nick ? ` · nickname <b>${escapeHtml(nick)}</b>` : ''}</div>
        </div>
        ${vote ? `<span class="browse-row-vote vote-${vote}">${VOTE_LABELS[vote]}</span>` : ''}
        <span class="profile-row-arrow">›</span>
      </button>`;
  },

  onSearch(value) {
    this.query = value;
    this.limit = this.PAGE;
    this.render();
  },

  setFilter(kind, value) {
    this[kind]  = value;
    this.limit  = this.PAGE;
    this.render();
  },

  showMore() {
    this.limit += this.PAGE;
    this.render();
  },
};

const NAME_DETAILS = {
  current: null,

  open(nameStr) {
    const key = nameStr.toLowerCase();
    const n = NAMES.find(item => item.name.toLowerCase() === key) ||
      STATE.deck.find(item => item.name.toLowerCase() === key);
    if (!n) return;
    this.current = n;
    this.render();
    document.getElementById('name-sheet').classList.add('visible');
  },

  close() {
    this.current = null;
    document.getElementById('name-sheet').classList.remove('visible');
  },

  render() {
    const n = this.current;
    const el = document.getElementById('name-sheet-body');
    if (!n || !el) return;

    const vote      = STATE.myVotes[n.name];
    const nicknames = nicknamesFor(n);
    const origin    = (n.origin || []).map(capitalize).join(' · ');
    const facts     = [GENDER_LABELS[n.gender],
      Number.isFinite(n.syllables) ? `${n.syllables} syllable${n.syllables === 1 ? '' : 's'}` : '']
      .filter(Boolean).join(' · ');
    const tags      = [...(n.style || []), ...(n.tradition || [])];
    const ranks     = n.popularIn || [];
    const similar   = this._similar(n);
    const chip      = s => `<span class="sheet-chip">${escapeHtml(s)}</span>`;
    const voteBtn   = (type, icon, label) => `
      <button class="sheet-vote ${vote === type ? 'selected' : ''} vote-${type}"
        onclick="NAME_DETAILS.vote('${type}')" aria-pressed="${vote === type}">
        <span>${icon}</span>${label}
      </button>`;

    el.innerHTML = `
      <div class="sheet-title">
        <div class="sheet-name" id="sheet-name">${escapeHtml(n.name)}</div>
        ${NAME_AUDIO.button(n.name)}
      </div>
      <div class="sheet-facts">${escapeHtml(facts)}${origin ? ` · ${escapeHtml(origin)}` : ''}</div>
      ${n.meaning ? `<div class="sheet-meaning">"${escapeHtml(n.meaning)}"</div>` : ''}
      ${n.aiSuggested ? `<div class="recommend-tag">✨ Suggested by AI</div>` : ''}

      <div class="sheet-section">
        <div class="sheet-label">Common nicknames</div>
        <div class="sheet-chips">${nicknames.length ? nicknames.map(chip).join('')
          : '<span class="sheet-none">No common nicknames</span>'}</div>
      </div>

      <div class="sheet-section">
        <div class="sheet-label">2025 top 100 rankings</div>
        <div class="sheet-chips">${ranks.length
          ? ranks.map(r => chip(`${r.jurisdiction} #${r.position}${n.gender === 'either' ? ` · ${r.gender}` : ''}`)).join('')
          : '<span class="sheet-none">Not in tracked top 100s</span>'}</div>
      </div>

      ${tags.length ? `
      <div class="sheet-section">
        <div class="sheet-label">Style</div>
        <div class="sheet-chips">${tags.map(t => chip(capitalize(t))).join('')}</div>
      </div>` : ''}

      ${similar.length ? `
      <div class="sheet-section">
        <div class="sheet-label">Similar names</div>
        <div class="sheet-chips">${similar.map(s => `
          <button class="sheet-chip sheet-chip-link" data-name="${escapeHtml(s.name)}"
            onclick="NAME_DETAILS.open(this.dataset.name)">${escapeHtml(s.name)}</button>`).join('')}</div>
      </div>` : ''}

      <div class="sheet-votes">
        ${voteBtn('pass', '✕', 'Pass')}
        ${voteBtn('maybe', '🤔', 'Maybe')}
        ${voteBtn('love', '❤️', 'Love')}
      </div>`;
  },

  // Same-gender names sharing the most origins and styles
  _similar(n) {
    const origins = new Set(n.origin || []);
    const styles  = new Set(n.style || []);
    if (origins.size === 0 && styles.size === 0) return [];
    return NAMES
      .filter(o => o !== n && (o.gender === n.gender || o.gender === 'either' || n.gender === 'either'))
      .map(o => ({
        o,
        score: (o.origin || []).filter(x => origins.has(x)).length * 2 +
               (o.style  || []).filter(x => styles.has(x)).length,
      }))
      .filter(x => x.score >= 2)
      .sort((a, b) => b.score - a.score || (b.o.popularIn?.length || 0) - (a.o.popularIn?.length || 0) ||
                      a.o.name.localeCompare(b.o.name))
      .slice(0, 8)
      .map(x => x.o);
  },

  async vote(voteType) {
    const n = this.current;
    if (!n) return;
    const ok = await saveVote(n.name, voteType);
    if (!ok) return;
    showToast(`${n.name} ${voteType === 'love' ? '❤️' : voteType === 'maybe' ? '🤔' : '✕'}`);
    if (this.current === n) this.render();
    BROWSE.render();
  },
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && NAME_DETAILS.current) NAME_DETAILS.close();
});
