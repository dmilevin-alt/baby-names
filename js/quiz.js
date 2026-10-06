// ── QUIZ ───────────────────────────────────────────────────────────────────────
// 8 steps. Answers stored in quizAnswers then saved to Supabase.

const QUIZ = {
  step: 0,
  answers: {
    gender_pref:     '',
    tradition:       [],
    backgrounds:     [],
    styles:          [],
    length_pref:     'any',
    include_letters: '',
    avoid_letters:   '',
    vibe:            '',
    full_name:       '',
    sibling_names:   ''
  },

  steps: [
    'family', 'gender', 'tradition', 'backgrounds', 'styles', 'length', 'letters', 'vibe'
  ],

  init() {
    this.step = 0;
    this.answers = {
      gender_pref: '', tradition: [], backgrounds: [],
      styles: [], length_pref: 'any', include_letters: '', avoid_letters: '', vibe: '',
      full_name: STATE.profile?.display_name || '', sibling_names: ''
    };
    this.render();
  },

  render() {
    const screen = document.getElementById('quiz-screen');
    screen.innerHTML = `
      <div class="quiz-header">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
          <h2>Your Preferences</h2>
          <button class="btn-logout-sm" onclick="PROFILE.logout()">Log out</button>
        </div>
        <p>Just for you — your partner answers separately.</p>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" id="quiz-progress-fill" style="width:${(this.step / this.steps.length) * 100}%"></div>
        </div>
      </div>
      <div class="quiz-body" id="quiz-body"></div>
      <div class="quiz-footer">
        ${this.step > 0 ? `<button class="btn btn-secondary" style="flex:1" onclick="QUIZ.back()">Back</button>` : ''}
        <button class="btn btn-primary" style="flex:2" id="quiz-next-btn" onclick="QUIZ.next()">
          ${this.step === this.steps.length - 1 ? 'See my names ❤️' : 'Next'}
        </button>
      </div>
    `;
    this.renderStep();
  },

  renderStep() {
    const body  = document.getElementById('quiz-body');
    const stepName = this.steps[this.step];

    switch (stepName) {
      case 'family':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>First, a little about your family</h3>
            <p class="hint">Optional. The AI uses this to show how names sound with your surname and next to your other children's names.</p>
            <label class="family-label" for="quiz-full-name">Your full name</label>
            <input class="quiz-input" id="quiz-full-name" placeholder="e.g. Dana Levin" maxlength="80"
              autocomplete="name" value="${escapeHtml(this.answers.full_name)}"
              oninput="QUIZ.answers.full_name=this.value">
            <label class="family-label" for="quiz-siblings">Names of your other children</label>
            <input class="quiz-input" id="quiz-siblings" placeholder="e.g. Mia, Leo (leave blank if none)" maxlength="200"
              value="${escapeHtml(this.answers.sibling_names)}"
              oninput="QUIZ.answers.sibling_names=this.value">
          </div>`;
        break;

      case 'gender':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>What gender are you hoping for?</h3>
            <div class="choice-grid" id="gender-grid">
              ${[['girl','Girl 👧'],['boy','Boy 👦'],['either','Either / surprise 🤷']].map(([v,l]) =>
                `<button class="choice-pill ${this.answers.gender_pref===v?'selected':''}"
                  onclick="QUIZ.pickOne('gender_pref','${v}',this)">${l}</button>`
              ).join('')}
            </div>
          </div>`;
        break;

      case 'tradition':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>Any religious or cultural tradition?</h3>
            <p class="hint">Select all that apply — or skip.</p>
            <div class="choice-grid">
              ${[['jewish','Jewish'],['christian','Christian'],['orthodox','Orthodox'],
                 ['muslim','Muslim'],['hindu','Hindu'],['secular','Secular / no preference']]
                .map(([v,l]) =>
                  `<button class="choice-pill ${this.answers.tradition.includes(v)?'selected':''}"
                    onclick="QUIZ.toggleMulti('tradition','${v}',this)">${l}</button>`
                ).join('')}
            </div>
          </div>`;
        break;

      case 'backgrounds':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>Cultural backgrounds to draw from?</h3>
            <p class="hint">Pick any that feel meaningful to you.</p>
            <div class="choice-grid">
              ${[['hebrew','Hebrew / Israeli'],['ukrainian','Ukrainian'],['russian','Russian'],
                 ['persian','Persian / Iranian'],['english','English'],['french','French'],
                 ['arabic','Arabic'],['slavic','Slavic'],['greek','Greek'],
                 ['latin','Latin / Italian'],['spanish','Spanish'],['scandinavian','Scandinavian'],
                 ['irish','Irish / Celtic'],['german','German'],['hindi','Indian / Hindi'],
                 ['japanese','Japanese / East Asian']]
                .map(([v,l]) =>
                  `<button class="choice-pill ${this.answers.backgrounds.includes(v)?'selected':''}"
                    onclick="QUIZ.toggleMulti('backgrounds','${v}',this)">${l}</button>`
                ).join('')}
            </div>
          </div>`;
        break;

      case 'styles':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>What style do you love?</h3>
            <p class="hint">Pick as many as you like.</p>
            <div class="choice-grid">
              ${[['classic','Classic'],['modern','Modern'],['unique','Unique / uncommon'],
                 ['nature','Nature-inspired'],['vintage','Vintage'],
                 ['famous','Inspired by athletes & celebrities']]
                .map(([v,l]) =>
                  `<button class="choice-pill ${this.answers.styles.includes(v)?'selected':''}"
                    onclick="QUIZ.toggleMulti('styles','${v}',this)">${l}</button>`
                ).join('')}
            </div>
          </div>`;
        break;

      case 'length':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>How long should the name be?</h3>
            <div class="choice-grid">
              ${[['short','Short (1–2 syllables)'],['medium','Medium (2–3 syllables)'],
                 ['long','Long (3+ syllables)'],['any','No preference']]
                .map(([v,l]) =>
                  `<button class="choice-pill ${this.answers.length_pref===v?'selected':''}"
                    onclick="QUIZ.pickOne('length_pref','${v}',this)">${l}</button>`
                ).join('')}
            </div>
          </div>`;
        break;

      case 'letters':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>Any letters to include or avoid?</h3>
            <p class="hint">Optional. Separate with commas, e.g. A, M</p>
            <label style="font-size:14px;font-weight:700;margin-bottom:4px;display:block">
              Prefer names starting with…
            </label>
            <input class="quiz-input" id="include-input" placeholder="e.g. A, M, S"
              value="${this.answers.include_letters}"
              oninput="QUIZ.answers.include_letters=this.value">
            <label style="font-size:14px;font-weight:700;margin-bottom:4px;display:block;margin-top:8px">
              Avoid names starting with…
            </label>
            <input class="quiz-input" id="avoid-input" placeholder="e.g. K, X"
              value="${this.answers.avoid_letters}"
              oninput="QUIZ.answers.avoid_letters=this.value">
          </div>`;
        break;

      case 'vibe':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>Describe your dream name in a few words</h3>
            <p class="hint">Optional — just for fun! e.g. "strong but gentle, something unusual"</p>
            <textarea class="quiz-input" id="vibe-input" placeholder="Your dream name feels…"
              rows="3"
              oninput="QUIZ.answers.vibe=this.value">${this.answers.vibe}</textarea>
          </div>`;
        break;
    }
  },

  pickOne(field, value, el) {
    this.answers[field] = value;
    el.closest('.choice-grid').querySelectorAll('.choice-pill').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  toggleMulti(field, value, el) {
    const arr = this.answers[field];
    const idx = arr.indexOf(value);
    if (idx === -1) arr.push(value);
    else arr.splice(idx, 1);
    el.classList.toggle('selected', arr.includes(value));
  },

  validate() {
    const stepName = this.steps[this.step];
    if (stepName === 'gender' && !this.answers.gender_pref) {
      showToast('Please pick a gender preference');
      return false;
    }
    return true;
  },

  next() {
    if (!this.validate()) return;
    if (this.step < this.steps.length - 1) {
      this.step++;
      this.render();
    } else {
      this.save();
    }
  },

  back() {
    if (this.step > 0) {
      this.step--;
      this.render();
    }
  },

  async save() {
    const btn = document.getElementById('quiz-next-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    const payload = {
      room_id:         STATE.room.id,
      user_id:         STATE.user.id,
      gender_pref:     this.answers.gender_pref || 'either',
      tradition:       this.answers.tradition.length ? this.answers.tradition : null,
      backgrounds:     this.answers.backgrounds,
      styles:          this.answers.styles,
      length_pref:     this.answers.length_pref || 'any',
      include_letters: this.answers.include_letters.trim() || null,
      avoid_letters:   this.answers.avoid_letters.trim() || null,
      vibe:            this.answers.vibe.trim() || null,
      full_name:       this.answers.full_name.trim().replace(/\s+/g, ' ') || null,
      sibling_names:   parseNameList(this.answers.sibling_names)
    };

    const { data, error } = await STATE.db
      .from('preferences')
      .upsert(payload, { onConflict: 'room_id,user_id' })
      .select()
      .single();

    if (error) {
      showToast('Could not save. Please try again.');
      btn.disabled = false;
      btn.textContent = 'See my names ❤️';
      return;
    }

    STATE.myPrefs = data;

    // Check if partner has also done the quiz
    const { data: allPrefs } = await STATE.db
      .from('preferences')
      .select('*')
      .eq('room_id', STATE.room.id);

    STATE.partnerPrefs = allPrefs ? allPrefs.find(p => p.user_id !== STATE.user.id) || null : null;
    await enterMainApp();
  }
};
