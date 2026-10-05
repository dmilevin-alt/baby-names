// ── FAMILY DETAILS ────────────────────────────────────────────────────────────
// Your full name and your other children's names, saved with your quiz answers.
// The AI uses them for full-name and sibling-pairing tips.

// "Mia, Leo and Sam" → ["Mia", "Leo", "Sam"]
function parseNameList(str) {
  return String(str || '')
    .split(/,|\band\b|&|\n/i)
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .slice(0, 10);
}

const FAMILY = {
  // Names from both partners' answers, for the AI
  context() {
    const prefs = [STATE.myPrefs, STATE.partnerPrefs].filter(Boolean);
    const parents = prefs.map(p => (p.full_name || '').trim()).filter(Boolean);
    const surnames = [...new Set(parents
      .map(n => n.split(' ').slice(1).pop())
      .filter(Boolean))];
    const seen = new Set();
    const siblings = prefs.flatMap(p => p.sibling_names || []).filter(n => {
      const key = n.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { parents, surnames, siblings };
  },

  hasDetails() {
    const { parents, siblings } = this.context();
    return parents.length > 0 || siblings.length > 0;
  },

  // Ask once, on entering the app, if you haven't answered yet
  maybePrompt() {
    const p = STATE.myPrefs;
    if (p && p.full_name == null && p.sibling_names == null) this.open(true);
  },

  open(firstTime = false) {
    const p = STATE.myPrefs || {};
    const fullName = p.full_name ?? (STATE.profile?.display_name || '');
    document.getElementById('family-sheet-body').innerHTML = `
      <div class="sheet-name" id="family-sheet-title">${firstTime ? 'One quick question' : 'Family details'}</div>
      <p class="sheet-intro">This helps the AI suggest how names sound with your surname and next to your other children's names.</p>
      <label class="family-label" for="family-full-name">Your full name</label>
      <input class="quiz-input" id="family-full-name" placeholder="e.g. Dana Levin" maxlength="80"
        autocomplete="name" value="${escapeHtml(fullName)}">
      <label class="family-label" for="family-siblings">Names of your other children</label>
      <input class="quiz-input" id="family-siblings" placeholder="e.g. Mia, Leo (leave blank if none)" maxlength="200"
        value="${escapeHtml((p.sibling_names || []).join(', '))}">
      <p class="family-note">Shared with your partner and sent to the AI only when you ask about a name.</p>
      <div class="family-actions">
        <button class="btn btn-secondary" onclick="FAMILY.${firstTime ? 'skip' : 'close'}()">${firstTime ? 'Skip' : 'Cancel'}</button>
        <button class="btn btn-primary" id="family-save-btn" onclick="FAMILY.save()">Save</button>
      </div>`;
    document.getElementById('family-sheet').classList.add('visible');
  },

  close() {
    document.getElementById('family-sheet').classList.remove('visible');
  },

  // Remember that you were asked, without saving any names
  async skip() {
    this.close();
    await this._update({ sibling_names: STATE.myPrefs?.sibling_names || [] });
  },

  async save() {
    const fullName = document.getElementById('family-full-name').value.trim().replace(/\s+/g, ' ');
    const siblings = parseNameList(document.getElementById('family-siblings').value);
    const btn = document.getElementById('family-save-btn');
    btn.disabled = true;
    const ok = await this._update({ full_name: fullName || null, sibling_names: siblings });
    btn.disabled = false;
    if (!ok) return;
    this.close();
    showToast('Family details saved ✓');
    PROFILE.populate();
    if (NAME_DETAILS.current) NAME_DETAILS.render();
  },

  async _update(fields) {
    if (!STATE.myPrefs) return false;
    const { data, error } = await STATE.db
      .from('preferences')
      .update(fields)
      .eq('room_id', STATE.room.id)
      .eq('user_id', STATE.user.id)
      .select()
      .single();
    if (error || !data) {
      console.error('Family details save failed:', error);
      showToast('Could not save. Try again.');
      return false;
    }
    STATE.myPrefs = data;
    return true;
  },

  summary() {
    const p = STATE.myPrefs || {};
    const parts = [p.full_name, (p.sibling_names || []).length ? `Children: ${p.sibling_names.join(', ')}` : '']
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Your name and other children';
  },
};
