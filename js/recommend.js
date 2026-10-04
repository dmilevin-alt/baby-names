// ── RECOMMENDATION ENGINE ─────────────────────────────────────────────────────
const RECOMMEND = {

  // Derive the same hard filters the deck uses, from quiz prefs.
  _buildFilters() {
    const p1 = STATE.myPrefs      || {};
    const p2 = STATE.partnerPrefs || {};

    // Gender — mirror deck.js logic exactly
    let genderFilter = 'all';
    if (p1.gender_pref && p2.gender_pref) {
      if (p1.gender_pref === p2.gender_pref) {
        genderFilter = p1.gender_pref;
      } else if (p1.gender_pref === 'either') {
        genderFilter = p2.gender_pref;
      } else if (p2.gender_pref === 'either') {
        genderFilter = p1.gender_pref;
      }
      // If they chose opposite genders, genderFilter stays 'all'
    } else if (p1.gender_pref && p1.gender_pref !== 'either') {
      genderFilter = p1.gender_pref; // partner prefs not yet loaded → use mine
    }

    // Avoid letters — union of both
    const avoidSet = new Set();
    parseLetters(p1.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));
    parseLetters(p2.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));

    // Quiz-derived soft boosts
    const quizOrigins   = union(p1.backgrounds || [], p2.backgrounds || []);
    const quizStyles    = union(p1.styles       || [], p2.styles       || []);
    const quizTrad      = union(p1.tradition    || [], p2.tradition    || []);
    const includeLetters = union(
      parseLetters(p1.include_letters),
      parseLetters(p2.include_letters)
    ).map(l => l.toUpperCase());

    return { genderFilter, avoidSet, quizOrigins, quizStyles, quizTrad, includeLetters,
             lengthPref1: p1.length_pref, lengthPref2: p2.length_pref };
  },

  // Score every unvoted name against the user's taste profile + quiz answers.
  _score() {
    const votes     = STATE.myVotes;
    const loveNames = Object.entries(votes).filter(([, v]) => v === 'love').map(([n]) => n);
    const maybeNames= Object.entries(votes).filter(([, v]) => v === 'maybe').map(([n]) => n);
    const positive  = [...loveNames, ...maybeNames];
    if (positive.length === 0) return null;

    const filters = this._buildFilters();
    const { genderFilter, avoidSet, quizOrigins, quizStyles, quizTrad,
            includeLetters, lengthPref1, lengthPref2 } = filters;

    // Build vote-derived frequency maps (love = 2×, maybe = 1×)
    const originFreq = new Map(), styleFreq = new Map(), tradFreq = new Map();
    let sylSum = 0, sylCount = 0;

    for (const name of positive) {
      const w   = votes[name] === 'love' ? 2 : 1;
      const obj = NAMES.find(n => n.name === name);
      if (!obj) continue;
      (obj.origin    || []).forEach(o => originFreq.set(o, (originFreq.get(o) || 0) + w));
      (obj.style     || []).forEach(s => styleFreq.set(s,  (styleFreq.get(s)  || 0) + w));
      (obj.tradition || []).forEach(t => tradFreq.set(t,   (tradFreq.get(t)   || 0) + w));
      if (obj.syllables) { sylSum += obj.syllables * w; sylCount += w; }
    }

    const prefSyllables = sylCount ? Math.round(sylSum / sylCount) : null;

    // Candidates: unvoted, not shortlisted, pass hard filters
    const voted       = new Set(Object.keys(votes));
    const shortlisted = new Set(STATE.shortlist.map(s => s.name));

    const scored = NAMES
      .filter(n => {
        if (voted.has(n.name) || shortlisted.has(n.name)) return false;
        // ── Hard filter: gender ──────────────────────────────────────────────
        if (genderFilter !== 'all' && genderFilter !== 'either' &&
            n.gender !== 'either' && n.gender !== genderFilter) return false;
        // ── Hard filter: avoid letters ───────────────────────────────────────
        if (avoidSet.size > 0 && avoidSet.has(n.name[0].toUpperCase())) return false;
        return true;
      })
      .map(n => {
        let score = 0;

        // Vote-pattern signal (primary)
        score += (n.origin    || []).reduce((s, o)  => s + (originFreq.get(o)  || 0) * 3, 0);
        score += (n.style     || []).reduce((s, st) => s + (styleFreq.get(st)  || 0) * 2, 0);
        score += (n.tradition || []).reduce((s, t)  => s + (tradFreq.get(t)    || 0),     0);
        if (prefSyllables && n.syllables === prefSyllables) score += 3;

        // Quiz-answer boosts (secondary — break ties toward quiz preferences)
        if (quizOrigins.length  && (n.origin    || []).some(o => quizOrigins.includes(o)))  score += 2;
        if (quizStyles.length   && (n.style     || []).some(s => quizStyles.includes(s)))   score += 2;
        if (quizTrad.length === 0 || (n.tradition || []).some(t => quizTrad.includes(t)))    score += 1;
        if (checkNameLength(lengthPref1, n.syllables) || checkNameLength(lengthPref2, n.syllables)) score += 1;
        if (includeLetters.length && includeLetters.includes(n.name[0].toUpperCase()))       score += 1;

        return { n, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    const topOrigins = [...originFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([o]) => o);
    const topStyles  = [...styleFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([s]) => s);

    return { scored, topOrigins, topStyles, prefSyllables, genderFilter,
             loveCount: loveNames.length, maybeCount: maybeNames.length };
  },

  render(body) {
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

    const result = this._score();
    if (!result || result.scored.length === 0) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">✨</div>
          <h3>Nothing new to suggest</h3>
          <p>You've rated most of the names that match your taste. Try the Maybes tab to revisit names you were unsure about.</p>
        </div>`;
      return;
    }

    const { scored, topOrigins, topStyles, prefSyllables, genderFilter, loveCount, maybeCount } = result;
    const top10 = scored.slice(0, 10);

    const tagStr = [...topOrigins, ...topStyles]
      .slice(0, 4)
      .map(t => t.charAt(0).toUpperCase() + t.slice(1))
      .join(' · ');

    const sylNote    = prefSyllables ? ` · ${prefSyllables}-syllable` : '';
    const genderNote = genderFilter === 'girl' ? ' · Girls only'
                     : genderFilter === 'boy'  ? ' · Boys only' : '';

    body.innerHTML = `
      <div class="recommend-intro">
        <div class="recommend-intro-label">Personalised picks</div>
        <div class="recommend-intro-tags">${tagStr}${sylNote}${genderNote}</div>
        <div class="recommend-intro-sub">Based on your ${loveCount} ❤️ loves and ${maybeCount} 🤔 maybes</div>
      </div>
      <div class="shortlist-list">
        ${top10.map(({ n }) => this._renderCard(n)).join('')}
      </div>`;
  },

  _renderCard(n) {
    const origin = (n.origin || []).map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(' · ');
    const ranks  = (n.popularIn || []).map(r => `${r.jurisdiction} #${r.position}`).join(' · ');
    const sub    = [origin, ranks].filter(Boolean).join(' · ');

    return `
      <div class="shortlist-item recommend-item" id="rec-${n.name.replace(/\s/g,'_')}">
        <div class="shortlist-item-head">
          <div style="flex:1;min-width:0">
            <div class="shortlist-item-name">${n.name}</div>
            ${sub      ? `<div class="shortlist-item-sub">${sub}</div>` : ''}
            ${n.meaning ? `<div class="shortlist-item-sub recommend-meaning">"${n.meaning}"</div>` : ''}
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

    // Advance deckIndex past this name if it's still pending in the deck
    while (STATE.deckIndex < STATE.deck.length &&
           STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
      STATE.deckIndex++;
    }

    try {
      await STATE.db.from('votes').upsert({
        room_id: STATE.room.id,
        user_id: STATE.user.id,
        name:    nameStr,
        vote:    voteType
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
  }
};
