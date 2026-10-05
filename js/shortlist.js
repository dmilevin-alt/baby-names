// ── SHORTLIST ─────────────────────────────────────────────────────────────────
const SHORTLIST = {
  view: 'matches',

  render() {
    const body = document.getElementById('shortlist-body');
    if (!body) return;

    const matchesTab = document.getElementById('matches-tab');
    const maybesTab  = document.getElementById('maybes-tab');
    const foryouTab  = document.getElementById('foryou-tab');
    const maybeCount = Object.values(STATE.myVotes).filter(vote => vote === 'maybe').length;
    if (matchesTab) matchesTab.textContent = `❤️ Matches (${STATE.shortlist.length})`;
    if (maybesTab)  maybesTab.textContent  = `🤔 Maybes (${maybeCount})`;
    [matchesTab, maybesTab, foryouTab].forEach(tab => {
      if (!tab) return;
      const v = tab.id.replace('-tab', '');
      tab.classList.toggle('active', this.view === v);
      tab.setAttribute('aria-selected', String(this.view === v));
    });

    if (this.view === 'maybes') { this.renderMaybes(body); return; }
    if (this.view === 'foryou') { RECOMMEND.render(body);  return; }

    const items = STATE.shortlist;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">⭐</div>
          <h3>No matches yet</h3>
          <p>${STATE.room.partner_id
            ? "Keep swiping! When you both love the same name, it'll appear here."
            : `Matches appear once your partner joins with code <b>${escapeHtml(STATE.room.invite_code)}</b> and loves the same names. Keep swiping!`}</p>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="shortlist-list">
        ${items.map(item => this.renderItem(item)).join('')}
      </div>`;
  },

  setView(view) {
    this.view = view;
    this.render();
  },

  renderMaybes(body) {
    const deckPositions = new Map(STATE.deck.map((name, index) => [name.name, index]));
    const names = Object.entries(STATE.myVotes)
      .filter(([, vote]) => vote === 'maybe')
      .map(([name]) => name)
      .sort((a, b) => (deckPositions.get(a) ?? Infinity) - (deckPositions.get(b) ?? Infinity));

    if (names.length === 0) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">🤔</div>
          <h3>No maybe names yet</h3>
          <p>Names you mark Maybe while swiping will appear here.</p>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="shortlist-list">
        ${names.map(name => this.renderMaybeItem(name)).join('')}
      </div>`;
  },

  renderMaybeItem(name) {
    const nameObj = STATE.deck.find(item => item.name === name) ||
      NAMES.find(item => item.name === name);
    const origin = nameObj ? (nameObj.origin || []).map(capitalize).join(' · ') : '';
    const rankings = nameObj?.popularIn || [];
    const rankingText = rankings.length
      ? rankings.map(item => `${item.jurisdiction} #${item.position}`).join(' · ')
      : 'Not in tracked top 100s';

    return `
      <div class="shortlist-item maybe-item" id="maybe-${name.replace(/\W/g, '_')}">
        <div class="shortlist-item-head">
          <div style="flex:1;min-width:0">
            <div class="shortlist-item-name">${name}</div>
            <div class="shortlist-item-sub">${origin || rankingText}</div>
            ${origin && rankings.length
              ? `<div class="shortlist-item-sub">${rankingText}</div>`
              : ''}
          </div>
          <div class="recommend-actions">
            <button class="rec-btn rec-love" data-name="${name}"
              onclick="SHORTLIST.resolveMaybe(this.dataset.name, 'love')"
              title="Love" aria-label="Love ${name}">❤️</button>
            <button class="rec-btn rec-pass" data-name="${name}"
              onclick="SHORTLIST.resolveMaybe(this.dataset.name, 'pass')"
              title="Dismiss" aria-label="Dismiss ${name}">✕</button>
          </div>
        </div>
      </div>`;
  },

  async resolveMaybe(name, voteType) {
    const previous = STATE.myVotes[name];
    STATE.myVotes[name] = voteType;

    const { error } = await STATE.db.from('votes').upsert({
      room_id: STATE.room.id,
      user_id: STATE.user.id,
      name:    name,
      vote:    voteType
    }, { onConflict: 'room_id,user_id,name' });

    if (error) {
      STATE.myVotes[name] = previous;
      showToast('Could not save. Try again.');
      return;
    }

    if (voteType === 'love') await checkForNewMatches();
    showToast(voteType === 'love' ? `${name} ❤️ Loved` : `${name} dismissed`);

    const el = document.getElementById('maybe-' + name.replace(/\W/g, '_'));
    if (el) {
      el.style.transition = 'opacity .25s';
      el.style.opacity    = '0';
      setTimeout(() => { this.render(); SWIPE.updateProgress(); }, 280);
    } else {
      this.render();
      SWIPE.updateProgress();
    }
  },

  renderItem(item) {
    const nameObj  = STATE.deck.find(d => d.name === item.name);
    const origin   = nameObj ? (nameObj.origin || []).map(capitalize).join(' · ') : '—';
    const meaning  = nameObj ? nameObj.meaning : '';
    const isCustom = item.is_custom;

    return `
      <div class="shortlist-item" id="sl-${item.id}">
        <div class="shortlist-item-head" onclick="SHORTLIST.toggle('${item.id}')">
          <div>
            <div class="shortlist-item-name">${escapeHtml(item.name)}</div>
            <div class="shortlist-item-sub">${origin}</div>
          </div>
          <span class="shortlist-item-badge ${isCustom ? 'custom' : ''}">
            ${isCustom ? 'Custom' : '❤️ Match'}
          </span>
        </div>
        <div class="shortlist-item-body">
          ${meaning ? `<div class="shortlist-meaning">"${meaning}"</div>` : ''}
          <label style="font-size:13px;font-weight:700;color:var(--text-muted)">
            Why we love it
          </label>
          <textarea class="shortlist-note-area" id="note-${item.id}"
            placeholder="Add a note…">${escapeHtml(item.note || '')}</textarea>
          <div class="shortlist-item-actions">
            <button class="btn-save-note" onclick="SHORTLIST.saveNote('${item.id}')">Save note</button>
            <button class="btn-remove" data-name="${escapeHtml(item.name)}"
              onclick="SHORTLIST.remove('${item.id}', this.dataset.name)">Remove</button>
          </div>
        </div>
      </div>`;
  },

  toggle(id) {
    const el = document.getElementById('sl-' + id);
    if (el) el.classList.toggle('open');
  },

  async saveNote(id) {
    const textarea = document.getElementById('note-' + id);
    if (!textarea) return;
    const note = textarea.value.trim();

    const { error } = await STATE.db
      .from('shortlist')
      .update({ note })
      .eq('id', id);

    if (error) { showToast('Could not save. Try again.'); return; }

    const item = STATE.shortlist.find(s => s.id === id);
    if (item) item.note = note;

    showToast('Note saved ✓');
  },

  async remove(id, name) {
    if (!confirm(`Remove "${name}" from your shortlist?`)) return;

    const { error } = await STATE.db
      .from('shortlist')
      .delete()
      .eq('id', id);

    if (error) { showToast('Could not remove. Try again.'); return; }

    STATE.shortlist = STATE.shortlist.filter(s => s.id !== id);
    this.render();
    SWIPE.updateProgress();
    showToast(`${name} removed`);
  },

  toggleAddForm() {
    const form = document.getElementById('add-form');
    if (form) form.classList.toggle('open');
  },

  async addCustom() {
    const nameInput = document.getElementById('custom-name-input');
    const noteInput = document.getElementById('custom-note-input');
    if (!nameInput) return;

    const typed = nameInput.value.trim();
    if (!typed) { showToast('Please enter a name'); return; }
    // Use the app's spelling when it already has this name, so votes line up
    const known = NAMES.find(n => n.name.toLowerCase() === typed.toLowerCase());
    const name  = known ? known.name : typed;

    // Check for duplicate
    if (STATE.shortlist.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      showToast(`"${name}" is already on your shortlist`);
      return;
    }

    const { data, error } = await STATE.db
      .from('shortlist')
      .insert({
        room_id:   STATE.room.id,
        name:      name,
        is_custom: true,
        note:      noteInput ? noteInput.value.trim() || null : null,
        added_by:  STATE.user.id
      })
      .select()
      .single();

    if (error) { showToast('Could not add. Try again.'); return; }

    STATE.shortlist.unshift(data);
    nameInput.value = '';
    if (noteInput) noteInput.value = '';
    this.toggleAddForm();
    await this.syncCustomNames();
    this.render();
    showToast(`"${name}" added ✓ Your partner will see it next in their deck`);
  },

  // Custom names count as a Love from whoever added them, and go next in
  // the other partner's swipe deck so they can vote on them
  async syncCustomNames() {
    const toLove = [];
    const toDeck = [];
    for (const item of STATE.shortlist.filter(s => s.is_custom)) {
      let base = NAMES.find(n => n.name.toLowerCase() === item.name.toLowerCase());
      if (!base) {
        base = { name: item.name, gender: 'either', origin: [], tradition: [], style: [],
                 meaning: '', syllables: null };
        NAMES.push(base);
      }
      if (STATE.myVotes[base.name]) continue;
      if (item.added_by === STATE.user.id) toLove.push(base.name);
      else toDeck.push({ ...base, score: 0, fromPartner: true, partnerNote: item.note || '' });
    }

    if (toLove.length) {
      const { error } = await STATE.db.from('votes').upsert(
        toLove.map(name => ({ room_id: STATE.room.id, user_id: STATE.user.id, name, vote: 'love' })),
        { onConflict: 'room_id,user_id,name' }
      );
      if (error) console.warn('Could not save love for custom names:', error);
      else {
        toLove.forEach(name => { STATE.myVotes[name] = 'love'; });
        await checkForNewMatches();
      }
    }

    // Leave a passes-only review deck alone; otherwise put them up next,
    // behind the card that's already showing
    if (toDeck.length === 0 || STATE.reviewMode) return;
    const names = new Set(toDeck.map(n => n.name));
    const ahead = STATE.deck.slice(STATE.deckIndex).filter(d => !names.has(d.name));
    const wasDone = ahead.length === 0;
    STATE.deck = [
      ...STATE.deck.slice(0, STATE.deckIndex),
      ...(wasDone ? [] : ahead.slice(0, 1)),
      ...toDeck,
      ...ahead.slice(1),
    ];
    if (wasDone) SWIPE.render();
    else SWIPE.updateProgress();
  }
};

// ── EMAIL MY LIST ─────────────────────────────────────────────────────────────
function emailMyList() {
  const lovedNames = Object.entries(STATE.myVotes)
    .filter(([, v]) => v === 'love')
    .map(([n]) => n);
  const maybeNames = Object.entries(STATE.myVotes)
    .filter(([, v]) => v === 'maybe')
    .map(([n]) => n);

  if (lovedNames.length === 0 && maybeNames.length === 0) {
    showToast('No loved or maybe names yet — keep swiping!');
    return;
  }

  const nameInfo = n => {
    const obj = NAMES.find(x => x.name === n);
    const origin = obj ? (obj.origin || []).map(capitalize).join('/') : '';
    const meaning = obj ? obj.meaning : '';
    let line = n;
    if (origin) line += ` (${origin})`;
    if (meaning) line += ` — "${meaning}"`;
    return line;
  };

  const matchNames = new Set(STATE.shortlist.filter(s => !s.is_custom).map(s => s.name));

  let body = 'My Baby Name List\n\n';

  if (lovedNames.length) {
    body += `❤️ LOVED (${lovedNames.length})\n`;
    lovedNames.forEach(n => {
      body += `• ${nameInfo(n)}${matchNames.has(n) ? ' ✓ Match!' : ''}\n`;
    });
    body += '\n';
  }

  if (maybeNames.length) {
    body += `🤔 MAYBE (${maybeNames.length})\n`;
    maybeNames.forEach(n => {
      body += `• ${nameInfo(n)}${matchNames.has(n) ? ' ✓ Match!' : ''}\n`;
    });
    body += '\n';
  }

  const mutualMatches = STATE.shortlist.filter(s => !s.is_custom);
  if (mutualMatches.length) {
    body += `❤️ MUTUAL MATCHES (${mutualMatches.length})\n`;
    mutualMatches.forEach(s => { body += `• ${nameInfo(s.name)}\n`; });
  }

  const to      = encodeURIComponent(STATE.user.email);
  const subject = encodeURIComponent('My Baby Name List 💕');
  const encoded = encodeURIComponent(body);

  // mailto: bodies have ~2000 char limits in some clients — warn if truncated
  const link = `mailto:${to}?subject=${subject}&body=${encoded}`;
  if (link.length > 2000) {
    // Fall back to clipboard
    navigator.clipboard.writeText(body).then(() => {
      showToast('List copied to clipboard — paste it into an email!');
    }).catch(() => {
      showToast('List too long for email link. Try copying manually.');
    });
    return;
  }

  window.location.href = link;
}
