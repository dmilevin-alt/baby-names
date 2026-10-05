// ── SWIPE ENGINE ──────────────────────────────────────────────────────────────
const SWIPE = {
  dragging:   false,
  startX:     0,
  startY:     0,
  currentX:   0,
  currentY:   0,
  cardEl:     null,
  submitting: false,

  THRESHOLD_X: 80,   // px to trigger love/pass
  THRESHOLD_Y: -70,  // px upward to trigger maybe

  render() {
    this.updateProgress();
    this.renderCard();
  },

  updateProgress() {
    const total   = STATE.deck.length;
    const done    = STATE.reviewMode ? STATE.deckIndex : Object.keys(STATE.myVotes).length;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
    const matches = STATE.shortlist.filter(s => !s.is_custom).length;

    const countEl    = document.getElementById('swipe-count');
    const progressEl = document.getElementById('swipe-progress');
    const matchEl    = document.getElementById('match-count');

    if (countEl) {
      countEl.textContent = STATE.reviewMode
        ? `Reviewing passes · ${done} of ${total}`
        : done > 0 ? `${done} rated` : 'Start swiping!';
    }
    if (progressEl) progressEl.style.width = pct + '%';
    if (matchEl)    matchEl.textContent    = matches === 1 ? '1 match ❤️' : `${matches} matches ❤️`;
  },

  renderCard() {
    const stage = document.getElementById('card-stage');
    if (!stage) return;

    const idx  = STATE.deckIndex;
    const name = STATE.deck[idx];

    if (!name) {
      // All names voted
      document.getElementById('vote-buttons').style.display = 'none';

      const votes = STATE.myVotes;
      const loved  = Object.values(votes).filter(v => v === 'love').length;
      const maybe  = Object.values(votes).filter(v => v === 'maybe').length;
      const passed = Object.values(votes).filter(v => v === 'pass').length;

      const passedNames = STATE.deck.filter(d => votes[d.name] === 'pass');
      const totalVotes = loved + maybe + passed;
      const selectionInsights = buildSelectionInsights();
      const isPassReview = STATE.reviewMode;

      stage.innerHTML = `
        <div class="swipe-done">
          <div class="big-icon">🎉</div>
          <h3>${isPassReview ? 'Pass review complete!' : "You've seen all the names!"}</h3>
          <div class="swipe-done-stats">
            <div class="swipe-done-stat"><span class="swipe-done-stat-num">${loved}</span><span class="swipe-done-stat-label">❤️ Loved${totalVotes ? ` · ${Math.round(loved / totalVotes * 100)}%` : ''}</span></div>
            <div class="swipe-done-stat"><span class="swipe-done-stat-num">${maybe}</span><span class="swipe-done-stat-label">🤔 Maybe${totalVotes ? ` · ${Math.round(maybe / totalVotes * 100)}%` : ''}</span></div>
            <div class="swipe-done-stat"><span class="swipe-done-stat-num">${passed}</span><span class="swipe-done-stat-label">✕ Passed${totalVotes ? ` · ${Math.round(passed / totalVotes * 100)}%` : ''}</span></div>
          </div>
          ${selectionInsights}
          ${passedNames.length > 0 ? `
          <button class="btn btn-secondary" onclick="restartWithPassed()" style="margin-top:4px">
            Review ${passedNames.length} passed names →
          </button>` : ''}
          <button class="btn btn-secondary" onclick="emailMyList()" style="margin-top:4px">
            📧 Email my list
          </button>
          <button class="btn btn-primary" onclick="showMainScreen('shortlist-screen')" style="margin-top:8px">
            View Shortlist ⭐
          </button>
        </div>`;
      STATE.reviewMode = false;
      this.updateProgress();
      return;
    }

    document.getElementById('vote-buttons').style.display = '';

    const originText  = (name.origin || []).map(capitalize).join(' · ');
    const styleText   = (name.style  || []).map(capitalize).join(', ');
    const nicknames   = nicknamesFor(name);
    const knownSyllables = Number.isFinite(name.syllables);
    // Best 3 rankings on the card so the vote buttons stay on screen; all of them are in the details sheet
    const rankings = popularityList(name);
    const popularityItems = rankings.slice(0, 3).map(item =>
      `<span class="card-trending-rank">${item.jurisdiction} #${item.position.toLocaleString()} · ${item.gender} · ${item.year}</span>`
    ).join('') + (rankings.length > 3
      ? `<span class="card-trending-rank card-trending-more">+${rankings.length - 3} more</span>` : '');
    const sylDots     = Array.from({ length: knownSyllables ? Math.min(name.syllables, 5) : 0 }, () =>
      `<div class="syl-dot filled"></div>`
    ).join('');

    stage.innerHTML = `
      <div class="name-card" id="swipe-card">
        <div class="card-vote-label love-label"  id="label-love">LOVE</div>
        <div class="card-vote-label pass-label"  id="label-pass">PASS</div>
        <div class="card-vote-label maybe-label" id="label-maybe">MAYBE</div>
        ${name.fromPartner ? `<div class="card-partner-tag">💌 Added by your partner</div>` : ''}
        <div class="card-title">
          <div class="card-name">${escapeHtml(name.name)}</div>
          ${NAME_AUDIO.button(name.name)}
        </div>
        ${name.partnerNote ? `<div class="card-partner-note">"${escapeHtml(name.partnerNote)}"</div>` : ''}
        ${originText ? `<div class="card-origin">${originText}</div>` : ''}
        ${nicknames.length ? `<div class="card-nicknames">Nicknames: ${nicknames.map(escapeHtml).join(', ')}</div>` : ''}
        <div class="card-trending">
          <div class="card-trending-label">Popularity rankings</div>
          <div class="card-trending-list">${popularityItems || '<span class="card-trending-none">Not in tracked rankings</span>'}</div>
        </div>
        ${name.meaning ? `
        <div class="card-meaning-section">
          <div class="card-meaning-label">meaning</div>
          <div class="card-meaning">${name.meaning}</div>
        </div>` : ''}
        <div class="card-tags">
          ${styleText ? `<span class="card-tag">${styleText}</span>` : ''}
          ${(name.tradition || []).map(t => `<span class="card-tag">${capitalize(t)}</span>`).join('')}
        </div>
        <div class="card-syllables">
          ${sylDots}
          <span class="card-syl-label">${knownSyllables ? `${name.syllables} syl.` : 'Syllables unavailable'}</span>
        </div>
      </div>`;

    this.cardEl = document.getElementById('swipe-card');
    this.attachDrag();
  },

  attachDrag() {
    const card = this.cardEl;
    if (!card) return;

    // Touch
    card.addEventListener('touchstart', e => this.onDragStart(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    card.addEventListener('touchmove',  e => { e.preventDefault(); this.onDragMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    card.addEventListener('touchend',   () => this.onDragEnd());

    // Mouse (for desktop testing)
    card.addEventListener('mousedown', e => { this.onDragStart(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => { if (this.dragging) this.onDragMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { if (this.dragging) this.onDragEnd(); });
  },

  onDragStart(x, y) {
    if (this.submitting) return;
    this.dragging = true;
    this.startX   = x;
    this.startY   = y;
    this.currentX = 0;
    this.currentY = 0;
    if (this.cardEl) {
      this.cardEl.style.transition = 'none';
    }
  },

  onDragMove(x, y) {
    if (!this.dragging || !this.cardEl) return;
    this.currentX = x - this.startX;
    this.currentY = y - this.startY;

    const rot = this.currentX * 0.08;
    this.cardEl.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rot}deg)`;

    const absX = Math.abs(this.currentX);
    const loveEl  = document.getElementById('label-love');
    const passEl  = document.getElementById('label-pass');
    const maybeEl = document.getElementById('label-maybe');

    if (this.currentX > 40) {
      loveEl  && loveEl.classList.add('visible');
      passEl  && passEl.classList.remove('visible');
      maybeEl && maybeEl.classList.remove('visible');
    } else if (this.currentX < -40) {
      passEl  && passEl.classList.add('visible');
      loveEl  && loveEl.classList.remove('visible');
      maybeEl && maybeEl.classList.remove('visible');
    } else if (this.currentY < -50) {
      maybeEl && maybeEl.classList.add('visible');
      loveEl  && loveEl.classList.remove('visible');
      passEl  && passEl.classList.remove('visible');
    } else {
      loveEl  && loveEl.classList.remove('visible');
      passEl  && passEl.classList.remove('visible');
      maybeEl && maybeEl.classList.remove('visible');
    }
  },

  onDragEnd() {
    if (!this.dragging) return;
    this.dragging = false;

    if (!this.cardEl) return;

    if (this.currentX > this.THRESHOLD_X) {
      castVote('love');
    } else if (this.currentX < -this.THRESHOLD_X) {
      castVote('pass');
    } else if (this.currentY < this.THRESHOLD_Y) {
      castVote('maybe');
    } else {
      // Spring back to center
      this.cardEl.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94)';
      this.cardEl.style.transform  = 'translate(0,0) rotate(0deg)';
      ['label-love','label-pass','label-maybe'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
      });
    }
  },

  flyOut(direction) {
    if (!this.cardEl) return;
    this.cardEl.style.transition = 'transform .35s ease, opacity .35s ease';
    if (direction === 'love') {
      this.cardEl.style.transform = 'translate(160%, -20px) rotate(25deg)';
    } else if (direction === 'pass') {
      this.cardEl.style.transform = 'translate(-160%, -20px) rotate(-25deg)';
    } else {
      this.cardEl.style.transform = 'translate(0, -160%)';
    }
    this.cardEl.style.opacity = '0';
  }
};

// ── CAST VOTE (called from buttons and SWIPE.onDragEnd) ──────────────────────
async function castVote(voteType) {
  if (SWIPE.submitting) return;
  const idx  = STATE.deckIndex;
  const name = STATE.deck[idx];
  if (!name) return;

  SWIPE.submitting = true;

  // Animate card out
  SWIPE.flyOut(voteType);

  // Optimistically advance UI
  STATE.myVotes[name.name] = voteType;
  STATE.deckIndex++;
  while (!STATE.reviewMode && STATE.deckIndex < STATE.deck.length &&
         STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
    STATE.deckIndex++;
  }

  // Save to DB
  try {
    await STATE.db.from('votes').upsert({
      room_id: STATE.room.id,
      user_id: STATE.user.id,
      name:    name.name,
      vote:    voteType
    }, { onConflict: 'room_id,user_id,name' });

    // Check for new matches (only on love/maybe — pass can't produce a match)
    if (voteType !== 'pass') {
      await checkForNewMatches();
    }
  } catch (err) {
    console.error('Vote save failed:', err);
  }

  // Wait for fly-out animation then show next card
  setTimeout(() => {
    SWIPE.submitting = false;
    SWIPE.updateProgress();
    SWIPE.renderCard();
  }, 350);
}

// ── SAVE A VOTE CAST OUTSIDE THE SWIPE DECK (For You, Browse, name details) ──
// Returns true once saved; on failure restores the old vote and shows a toast
async function saveVote(nameStr, voteType) {
  const previous = STATE.myVotes[nameStr];
  STATE.myVotes[nameStr] = voteType;

  const { error } = await STATE.db.from('votes').upsert({
    room_id: STATE.room.id,
    user_id: STATE.user.id,
    name:    nameStr,
    vote:    voteType,
  }, { onConflict: 'room_id,user_id,name' });

  if (error) {
    console.error('Vote save failed:', error);
    if (previous === undefined) delete STATE.myVotes[nameStr];
    else STATE.myVotes[nameStr] = previous;
    showToast('Could not save. Try again.');
    return false;
  }

  // Skip past the name if it was the next card in the deck
  const startIndex = STATE.deckIndex;
  while (!STATE.reviewMode && STATE.deckIndex < STATE.deck.length &&
         STATE.myVotes[STATE.deck[STATE.deckIndex].name]) {
    STATE.deckIndex++;
  }
  if (STATE.deckIndex !== startIndex) SWIPE.render();
  else SWIPE.updateProgress();

  if (voteType !== 'pass') await checkForNewMatches();
  return true;
}

async function checkForNewMatches() {
  const { data, error } = await STATE.db.rpc('get_matches', { p_room_id: STATE.room.id });
  if (error || !data) return;

  const matchedNames = data.map(r => r.matched_name || r);
  // Custom names aren't matches yet; once both like one it becomes a real match
  const knownNames   = new Set(STATE.shortlist.filter(s => !s.is_custom).map(s => s.name));
  const newMatches   = matchedNames.filter(n => !knownNames.has(n));

  if (newMatches.length === 0) return;

  // Upsert new matches into shortlist
  const rows = newMatches.map(n => ({
    room_id:   STATE.room.id,
    name:      n,
    is_custom: false
  }));

  const { data: inserted } = await STATE.db
    .from('shortlist')
    .upsert(rows, { onConflict: 'room_id,name' })
    .select();

  if (inserted) {
    STATE.shortlist = [...inserted, ...STATE.shortlist.filter(s => !newMatches.includes(s.name))];
  }

  // Celebrate each new match
  const nameObjs = newMatches.map(n => STATE.deck.find(d => d.name === n) || { name: n, meaning: '' });

  nameObjs.forEach((obj, i) => {
    if (i === 0) {
      celebrateMatch(obj);
    } else {
      STATE.matchQueue.push(obj);
    }
  });

  SWIPE.updateProgress();
}

function restartWithPassed() {
  const passedNames = STATE.deck.filter(d => STATE.myVotes[d.name] === 'pass');
  if (passedNames.length === 0) return;

  STATE.deck = passedNames;
  STATE.deckIndex = 0;
  STATE.reviewMode = true;

  document.getElementById('vote-buttons').style.display = '';
  SWIPE.render();
}

function buildSelectionInsights() {
  const selectedNames = NAMES.filter(name =>
    STATE.myVotes[name.name] === 'love' || STATE.myVotes[name.name] === 'maybe'
  );
  if (selectedNames.length === 0) return '';

  const backgrounds = new Map();
  const styles = new Map();
  const addCounts = (counts, values) => {
    for (const value of new Set(values || [])) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  };

  for (const name of selectedNames) {
    addCounts(backgrounds, name.origin);
    addCounts(styles, name.style);
  }

  const topEntries = counts => [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
  const topBackgrounds = topEntries(backgrounds);
  const topStyles = topEntries(styles);
  const rankedCount = selectedNames.filter(name => (name.popularIn || []).length > 0).length;
  const insights = [];

  if (topBackgrounds.length) {
    insights.push(`
      <div class="swipe-done-insight">
        <span class="swipe-done-insight-label">Top backgrounds in your Love/Maybe picks</span>
        <span>${topBackgrounds.map(([name, count]) => `${capitalize(name)} (${count})`).join(' · ')}</span>
      </div>`);
  }
  if (topStyles.length) {
    insights.push(`
      <div class="swipe-done-insight">
        <span class="swipe-done-insight-label">Most common styles in your picks</span>
        <span>${topStyles.map(([name, count]) => `${capitalize(name)} (${count})`).join(' · ')}</span>
      </div>`);
  }
  insights.push(`
    <div class="swipe-done-insight">
      <span class="swipe-done-insight-label">Trending in tracked top 100s</span>
      <span>${rankedCount} of ${selectedNames.length} picks</span>
    </div>`);

  return `
    <div class="swipe-done-insights">
      <div class="swipe-done-insights-title">Your selection insights</div>
      ${insights.join('')}
    </div>`;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
