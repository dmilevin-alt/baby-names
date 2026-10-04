// ── RECOMMENDATION ENGINE ─────────────────────────────────────────────────────
const RECOMMEND = {

  // Hard-filter helpers — identical logic to deck.js
  _buildFilters() {
    const p1 = STATE.myPrefs      || {};
    const p2 = STATE.partnerPrefs || {};

    let genderFilter = 'all';
    if (p1.gender_pref && p2.gender_pref) {
      if (p1.gender_pref === p2.gender_pref)       genderFilter = p1.gender_pref;
      else if (p1.gender_pref === 'either')        genderFilter = p2.gender_pref;
      else if (p2.gender_pref === 'either')        genderFilter = p1.gender_pref;
    } else if (p1.gender_pref && p1.gender_pref !== 'either') {
      genderFilter = p1.gender_pref;
    }

    const avoidSet = new Set();
    parseLetters(p1.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));
    parseLetters(p2.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));

    return {
      genderFilter, avoidSet,
      quizOrigins:     union(p1.backgrounds || [], p2.backgrounds || []),
      quizStyles:      union(p1.styles       || [], p2.styles       || []),
      quizTrad:        union(p1.tradition    || [], p2.tradition    || []),
      includeLetters:  union(parseLetters(p1.include_letters), parseLetters(p2.include_letters)).map(l => l.toUpperCase()),
      lengthPref1: p1.length_pref,
      lengthPref2: p2.length_pref,
    };
  },

  // Return up to `limit` unvoted names that pass hard filters, sorted by quiz fit
  _candidates(filters, limit = 60) {
    const { genderFilter, avoidSet, quizOrigins, quizStyles, quizTrad,
            includeLetters, lengthPref1, lengthPref2 } = filters;
    const voted       = new Set(Object.keys(STATE.myVotes));
    const shortlisted = new Set(STATE.shortlist.map(s => s.name));

    return NAMES
      .filter(n => {
        if (voted.has(n.name) || shortlisted.has(n.name)) return false;
        if (genderFilter !== 'all' && genderFilter !== 'either' &&
            n.gender !== 'either' && n.gender !== genderFilter) return false;
        if (avoidSet.size > 0 && avoidSet.has(n.name[0].toUpperCase())) return false;
        return true;
      })
      .map(n => {
        let score = 0;
        if (quizOrigins.length  && (n.origin    || []).some(o => quizOrigins.includes(o)))  score += 2;
        if (quizStyles.length   && (n.style     || []).some(s => quizStyles.includes(s)))   score += 2;
        if (quizTrad.length === 0 || (n.tradition || []).some(t => quizTrad.includes(t)))    score += 1;
        if (checkNameLength(lengthPref1, n.syllables) || checkNameLength(lengthPref2, n.syllables)) score += 1;
        if (includeLetters.length && includeLetters.includes(n.name[0].toUpperCase()))       score += 1;
        return { ...n, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Build the vote-history examples to send to the AI
  _voteExamples(voteType, limit = 10) {
    return Object.entries(STATE.myVotes)
      .filter(([, v]) => v === voteType)
      .slice(0, limit)
      .map(([name]) => {
        const obj = NAMES.find(n => n.name === name) || {};
        return { name, origin: obj.origin || [], style: obj.style || [], meaning: obj.meaning || '' };
      });
  },

  // ── Main render ───────────────────────────────────────────────────────────
  async render(body) {
    if (!body) body = document.getElementById('shortlist-body');
    if (!body) return;

    const positiveCount = Object.values(STATE.myVotes).filter(v => v === 'love' || v === 'maybe').length;

    if (positiveCount < 5) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">✨</div>
          <h3>Keep swiping!</h3>
          <p>After you love or maybe a few more names, we'll start making personalised picks for you.</p>
        </div>`;
      return;
    }

    // Loading state
    body.innerHTML = `
      <div class="recommend-loading">
        <div class="spinner dark"></div>
        <p>Finding names just for you…</p>
      </div>`;

    const filters = this._buildFilters();
    const candidates = this._candidates(filters);

    if (candidates.length === 0) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">✨</div>
          <h3>Nothing new to suggest</h3>
          <p>You've rated most names that match your preferences. Try the Maybes tab to revisit names you were unsure about.</p>
        </div>`;
      return;
    }

    const p1 = STATE.myPrefs      || {};
    const p2 = STATE.partnerPrefs || {};
    const quizContext = {
      gender:       filters.genderFilter !== 'all' ? filters.genderFilter : 'no preference',
      backgrounds:  union(p1.backgrounds || [], p2.backgrounds || []),
      styles:       union(p1.styles       || [], p2.styles       || []),
      tradition:    union(p1.tradition    || [], p2.tradition    || []),
      length:       p1.length_pref || p2.length_pref || 'any',
      includeLetters: filters.includeLetters.join(', ') || null,
      avoidLetters:   [...filters.avoidSet].join(', ') || null,
    };

    let picks = null;
    try {
      const { data, error } = await STATE.db.functions.invoke('recommend', {
        body: {
          candidates:   candidates.map(({ name, gender, origin, style, meaning }) => ({ name, gender, origin, style, meaning })),
          loveExamples: this._voteExamples('love', 30),
          maybeExamples:this._voteExamples('maybe', 50),
          quizContext,
        },
      });
      if (!error && Array.isArray(data) && data.length > 0) picks = data;
    } catch (e) {
      console.warn('AI recommend failed, using algorithm:', e);
    }

    // Fallback: algorithm-based picks
    if (!picks) {
      picks = this._algorithmicPicks(candidates, filters);
    }

    this._renderResults(body, picks, candidates, filters);
  },

  // Algorithm fallback (used if edge function isn't deployed)
  _algorithmicPicks(candidates, filters) {
    const votes = STATE.myVotes;
    const originFreq = new Map(), styleFreq = new Map();
    for (const [name, v] of Object.entries(votes)) {
      if (v !== 'love' && v !== 'maybe') continue;
      const w = v === 'love' ? 2 : 1;
      const obj = NAMES.find(n => n.name === name);
      if (!obj) continue;
      (obj.origin || []).forEach(o => originFreq.set(o, (originFreq.get(o) || 0) + w));
      (obj.style  || []).forEach(s => styleFreq.set(s,  (styleFreq.get(s)  || 0) + w));
    }
    return candidates
      .map(n => {
        let score = n.score || 0;
        score += (n.origin || []).reduce((s, o) => s + (originFreq.get(o) || 0) * 3, 0);
        score += (n.style  || []).reduce((s, st) => s + (styleFreq.get(st) || 0) * 2, 0);
        return { name: n.name, reason: null, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  },

  _renderResults(body, picks, candidates, filters) {
    const { genderFilter } = filters;
    const genderNote = genderFilter === 'girl' ? ' · Girls only'
                     : genderFilter === 'boy'  ? ' · Boys only' : '';

    const isAI = picks[0]?.reason !== null && picks[0]?.reason !== undefined;

    body.innerHTML = `
      <div class="recommend-intro">
        <div class="recommend-intro-label">${isAI ? '✨ AI picks for you' : 'Personalised picks'}</div>
        <div class="recommend-intro-tags">${genderNote ? genderNote.slice(3) : 'Based on your quiz &amp; votes'}${genderNote}</div>
        ${isAI ? '<div class="recommend-intro-sub">Claude analysed your quiz answers and vote history</div>' : ''}
      </div>
      <div class="shortlist-list">
        ${picks.map(pick => {
          const nameObj = NAMES.find(n => n.name === pick.name) || { name: pick.name, origin: [], meaning: '' };
          return this._renderCard(nameObj, pick.reason);
        }).join('')}
      </div>`;
  },

  _renderCard(n, reason) {
    const origin = (n.origin || []).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(' · ');
    const ranks  = (n.popularIn || []).map(r => `${r.jurisdiction} #${r.position}`).join(' · ');
    const sub    = [origin, ranks].filter(Boolean).join(' · ');

    return `
      <div class="shortlist-item recommend-item" id="rec-${n.name.replace(/\s/g,'_')}">
        <div class="shortlist-item-head">
          <div style="flex:1;min-width:0">
            <div class="shortlist-item-name">${n.name}</div>
            ${sub    ? `<div class="shortlist-item-sub">${sub}</div>` : ''}
            ${reason ? `<div class="shortlist-item-sub recommend-reason">✨ ${reason}</div>` : ''}
            ${!reason && n.meaning ? `<div class="shortlist-item-sub recommend-meaning">"${n.meaning}"</div>` : ''}
          </div>
          <div class="recommend-actions">
            <button class="rec-btn rec-love"  onclick="RECOMMEND.quickVote('${n.name}','love')"  title="Love">❤️</button>
            <button class="rec-btn rec-maybe" onclick="RECOMMEND.quickVote('${n.name}','maybe')" title="Maybe">🤔</button>
            <button class="rec-btn rec-pass"  onclick="RECOMMEND.quickVote('${n.name}','pass')"  title="Pass">✕</button>
          </div>
        </div>
      </div>`;
  },

  async quickVote(nameStr, voteType) {
    STATE.myVotes[nameStr] = voteType;
    while (STATE.deckIndex < STATE.deck.length &&
           STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
      STATE.deckIndex++;
    }
    try {
      await STATE.db.from('votes').upsert({
        room_id: STATE.room.id,
        user_id: STATE.user.id,
        name:    nameStr,
        vote:    voteType,
      }, { onConflict: 'room_id,user_id,name' });
      if (voteType !== 'pass') await checkForNewMatches();
    } catch(e) {
      console.error('Recommend vote failed:', e);
    }
    const label = voteType === 'love' ? '❤️' : voteType === 'maybe' ? '🤔' : '✕';
    showToast(`${nameStr} ${label}`);

    const el = document.getElementById('rec-' + nameStr.replace(/\s/g,'_'));
    if (el) {
      el.style.transition = 'opacity .25s';
      el.style.opacity    = '0';
      setTimeout(() => this.render(), 280);
    } else {
      this.render();
    }
  },
};
