// ── SHORTLIST ─────────────────────────────────────────────────────────────────
const SHORTLIST = {
  view: 'matches',

  render() {
    const body = document.getElementById('shortlist-body');
    if (!body) return;

    const matchesTab = document.getElementById('matches-tab');
    const maybesTab = document.getElementById('maybes-tab');
    const maybeCount = Object.values(STATE.myVotes).filter(vote => vote === 'maybe').length;
    if (matchesTab) matchesTab.textContent = `❤️ Matches (${STATE.shortlist.length})`;
    if (maybesTab) maybesTab.textContent = `🤔 Maybes (${maybeCount})`;
    if (matchesTab) {
      matchesTab.classList.toggle('active', this.view === 'matches');
      matchesTab.setAttribute('aria-selected', String(this.view === 'matches'));
    }
    if (maybesTab) {
      maybesTab.classList.toggle('active', this.view === 'maybes');
      maybesTab.setAttribute('aria-selected', String(this.view === 'maybes'));
    }

    if (this.view === 'maybes') {
      this.renderMaybes(body);
      return;
    }

    const items = STATE.shortlist;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="shortlist-empty">
          <div class="big-icon">⭐</div>
          <h3>No matches yet</h3>
          <p>Keep swiping! When you both love the same name, it'll appear here.</p>
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
      <div class="shortlist-item maybe-item">
        <div class="shortlist-item-head">
          <div>
            <div class="shortlist-item-name">${name}</div>
            <div class="shortlist-item-sub">${origin || rankingText}</div>
            ${origin && rankings.length
              ? `<div class="shortlist-item-sub">${rankingText}</div>`
              : ''}
          </div>
          <span class="shortlist-item-badge maybe">🤔 Maybe</span>
        </div>
      </div>`;
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
            <div class="shortlist-item-name">${item.name}</div>
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
            placeholder="Add a note…">${item.note || ''}</textarea>
          <div class="shortlist-item-actions">
            <button class="btn-save-note" onclick="SHORTLIST.saveNote('${item.id}')">Save note</button>
            <button class="btn-remove" onclick="SHORTLIST.remove('${item.id}', '${item.name}')">Remove</button>
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

    const name = nameInput.value.trim();
    if (!name) { showToast('Please enter a name'); return; }

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
    this.render();
    showToast(`"${name}" added to shortlist ✓`);
  }
};
