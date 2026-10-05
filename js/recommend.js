// ── RECOMMENDATION ENGINE ─────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const RECOMMEND = {
  _newNames: new Map(),   // AI-invented names from the latest picks, by name

  // Turn a stored or AI-returned name into the same shape as names.js entries
  // (AI text, so tags are cleaned to plain words and the meaning can't carry HTML)
  _toNameEntry(n) {
    const words = arr => (Array.isArray(arr) ? arr : [])
      .map(w => String(w).toLowerCase().trim()).filter(w => /^[a-z][a-z -]*$/.test(w));
    return {
      name:      n.name,
      gender:    ['girl', 'boy', 'either'].includes(n.gender) ? n.gender : 'either',
      origin:    words(n.origin),
      tradition: [],
      style:     words(n.style),
      meaning:   String(n.meaning || '').replace(/[<>]/g, ''),
      syllables: Number.isFinite(n.syllables) ? n.syllables : null,
      aiSuggested: true,
    };
  },

  // Add names to NAMES (skipping ones already there); returns the ones added
  addToNamesList(names) {
    const known = new Set(NAMES.map(n => n.name.toLowerCase()));
    const added = [];
    for (const n of names) {
      if (!n?.name || !/^\p{L}[\p{L}' -]{0,29}$/u.test(n.name) ||
          known.has(n.name.toLowerCase())) continue;
      const entry = this._toNameEntry(n);
      NAMES.push(entry);
      known.add(entry.name.toLowerCase());
      added.push(entry);
    }
    return added;
  },

  // Save the AI's new names for this room and add them to the swipe deck
  async _saveNewNames(newNames) {
    const added = this.addToNamesList(newNames);
    if (added.length === 0) return;

    const { error } = await STATE.db.from('ai_names').upsert(
      added.map(n => ({
        room_id:   STATE.room.id,
        name:      n.name,
        gender:    n.gender,
        origin:    n.origin,
        style:     n.style,
        meaning:   n.meaning,
        syllables: n.syllables,
        added_by:  STATE.user.id,
      })),
      { onConflict: 'room_id,name', ignoreDuplicates: true }
    );
    if (error) console.warn('Could not save AI-suggested names:', error);

    // Passes-only review decks stay as they are; new names join the main deck
    if (STATE.reviewMode) return;
    const wasDone = STATE.deckIndex >= STATE.deck.length;
    const inDeck  = new Set(STATE.deck.map(d => d.name));
    STATE.deck.push(...added.filter(n => !inDeck.has(n.name)).map(n => ({ ...n, score: 0 })));
    while (STATE.deckIndex < STATE.deck.length &&
           STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
      STATE.deckIndex++;
    }
    if (wasDone && STATE.deckIndex < STATE.deck.length) SWIPE.render();
    else SWIPE.updateProgress();
  },

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

    // Everything already rated or matched, so the AI doesn't suggest it as new
    const excludeNames = union(Object.keys(STATE.myVotes), STATE.shortlist.map(s => s.name));

    let picks = null;
    try {
      const { data, error } = await STATE.db.functions.invoke('recommend', {
        body: {
          candidates:   candidates.map(({ name, gender, origin, style, meaning }) => ({ name, gender, origin, style, meaning })),
          loveExamples: this._voteExamples('love', 30),
          maybeExamples:this._voteExamples('maybe', 60),
          excludeNames,
          quizContext,
        },
      });
      if (!error && Array.isArray(data) && data.length > 0) picks = data;
    } catch (e) {
      console.warn('AI recommend failed, using algorithm:', e);
    }

    // Fallback: algorithm-based picks (only possible from names in the app)
    if (!picks && candidates.length > 0) {
      picks = this._algorithmicPicks(candidates, filters);
    }

    if (!picks) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">✨</div>
          <h3>Nothing new to suggest</h3>
          <p>You've rated every name that matches your preferences, and AI picks couldn't load right now. Try again later, or revisit names in the Maybes tab.</p>
        </div>`;
      return;
    }

    const newNames = picks.filter(p => p.source === 'new').map(p => this._toNameEntry(p));
    this._newNames = new Map(newNames.map(n => [n.name, n]));
    await this._saveNewNames(newNames);

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
    const sub = candidates.length === 0
      ? "You've rated every name in the app, so Claude suggested new ones"
      : 'Claude analysed your quiz answers, loves and maybes';

    body.innerHTML = `
      <div class="recommend-intro">
        <div class="recommend-intro-label">${isAI ? '✨ AI picks for you' : 'Personalised picks'}</div>
        <div class="recommend-intro-tags">${genderNote ? genderNote.slice(3) : 'Based on your quiz &amp; votes'}${genderNote}</div>
        ${isAI ? `<div class="recommend-intro-sub">${sub}</div>` : ''}
      </div>
      <div class="shortlist-list" id="recommend-list">
        ${picks.map(pick => {
          const nameObj = this._newNames.get(pick.name) ||
            NAMES.find(n => n.name === pick.name) || { name: pick.name, origin: [], meaning: '' };
          return this._renderCard(nameObj, pick.reason, pick.source);
        }).join('')}
      </div>`;
  },

  _cardId(name) {
    return 'rec-' + name.replace(/\W/g, '_');
  },

  _renderCard(n, reason, source) {
    const origin = (n.origin || []).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(' · ');
    const ranks  = (n.popularIn || []).map(r => `${r.jurisdiction} #${r.position}`).join(' · ');
    const sub    = [origin, ranks].filter(Boolean).join(' · ');
    const name   = escapeHtml(n.name);
    const tag    = source === 'maybe' ? '🤔 From your Maybes'
                 : source === 'new'   ? '✨ New name, added to your deck' : '';
    const isMaybe = source === 'maybe';

    return `
      <div class="shortlist-item recommend-item" id="${this._cardId(n.name)}">
        <div class="shortlist-item-head">
          <div style="flex:1;min-width:0">
            <div class="shortlist-item-name">${name}</div>
            ${tag    ? `<div class="recommend-tag">${tag}</div>` : ''}
            ${sub    ? `<div class="shortlist-item-sub">${escapeHtml(sub)}</div>` : ''}
            ${reason ? `<div class="shortlist-item-sub recommend-reason">✨ ${escapeHtml(reason)}</div>` : ''}
            ${(isMaybe || source === 'new' || !reason) && n.meaning
              ? `<div class="shortlist-item-sub recommend-meaning">"${escapeHtml(n.meaning)}"</div>` : ''}
          </div>
          <div class="recommend-actions">
            <button class="rec-btn rec-love" data-name="${name}" onclick="RECOMMEND.quickVote(this.dataset.name,'love')"
              title="Love" aria-label="Love ${name}">❤️</button>
            ${isMaybe ? '' : `<button class="rec-btn rec-maybe" data-name="${name}" onclick="RECOMMEND.quickVote(this.dataset.name,'maybe')"
              title="Maybe" aria-label="Maybe ${name}">🤔</button>`}
            <button class="rec-btn rec-pass" data-name="${name}" onclick="RECOMMEND.quickVote(this.dataset.name,'pass')"
              title="${isMaybe ? 'Dismiss' : 'Pass'}" aria-label="${isMaybe ? 'Dismiss' : 'Pass'} ${name}">✕</button>
          </div>
        </div>
      </div>`;
  },

  async quickVote(nameStr, voteType) {
    const previous = STATE.myVotes[nameStr];
    STATE.myVotes[nameStr] = voteType;

    const { error } = await STATE.db.from('votes').upsert({
      room_id: STATE.room.id,
      user_id: STATE.user.id,
      name:    nameStr,
      vote:    voteType,
    }, { onConflict: 'room_id,user_id,name' });

    if (error) {
      console.error('Recommend vote failed:', error);
      if (previous === undefined) delete STATE.myVotes[nameStr];
      else STATE.myVotes[nameStr] = previous;
      showToast('Could not save. Try again.');
      return;
    }

    while (STATE.deckIndex < STATE.deck.length &&
           STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
      STATE.deckIndex++;
    }
    if (voteType !== 'pass') await checkForNewMatches();

    const label = voteType === 'love' ? '❤️' : voteType === 'maybe' ? '🤔' : '✕';
    showToast(`${nameStr} ${label}`);

    const maybesTab = document.getElementById('maybes-tab');
    if (maybesTab) {
      const maybeCount = Object.values(STATE.myVotes).filter(v => v === 'maybe').length;
      maybesTab.textContent = `🤔 Maybes (${maybeCount})`;
    }

    // Remove just this card; fetch a fresh set of picks once they're all done
    const el = document.getElementById(this._cardId(nameStr));
    if (!el) { this.render(); return; }
    el.style.transition = 'opacity .25s';
    el.style.opacity    = '0';
    setTimeout(() => {
      el.remove();
      const list = document.getElementById('recommend-list');
      if (!list || list.children.length === 0) this.render();
    }, 280);
  },
};
