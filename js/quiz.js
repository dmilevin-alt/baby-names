// ── QUIZ ───────────────────────────────────────────────────────────────────────
// 9 steps. Answers stored in quizAnswers then saved to Supabase.

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
    'family', 'gender', 'tradition', 'backgrounds', 'popular', 'styles', 'length', 'letters', 'vibe'
  ],

  // Pass your saved answers to edit them; without them the quiz starts blank
  init(saved = null) {
    this.step = 0;
    this.editing = Boolean(saved);
    this.answers = {
      gender_pref:     saved?.gender_pref || '',
      tradition:       [...(saved?.tradition || [])],
      backgrounds:     [...(saved?.backgrounds || [])],
      styles:          [...(saved?.styles || [])],
      length_pref:     saved?.length_pref || 'any',
      include_letters: saved?.include_letters || '',
      avoid_letters:   saved?.avoid_letters || '',
      vibe:            saved?.vibe || '',
      full_name:       saved?.full_name ?? (STATE.profile?.display_name || ''),
      sibling_names:   (saved?.sibling_names || []).join(', '),
      // New answers default to "only these backgrounds"; older saved answers ranked them first
      backgrounds_strict: saved ? Boolean(saved.backgrounds_strict) : true,
      popular_in:      [...(saved?.popular_in || [])],
      popular_mode:    (saved?.popular_in || []).length ? 'top' : 'all',
    };
    this.render();
  },

  cancel() {
    showMainScreen('profile-screen');
  },

  render() {
    const screen = document.getElementById('quiz-screen');
    screen.innerHTML = `
      <div class="quiz-header">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
          <h2>${this.editing ? 'Update your answers' : 'Your Preferences'}</h2>
          ${this.editing
            ? `<button class="btn-logout-sm" onclick="QUIZ.cancel()">Cancel</button>`
            : `<button class="btn-logout-sm" onclick="PROFILE.logout()">Log out</button>`}
        </div>
        <p>${this.editing
          ? 'Your names update as soon as you save. Names you already rated stay rated.'
          : 'Just for you — your partner answers separately.'}</p>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" id="quiz-progress-fill" style="width:${(this.step / this.steps.length) * 100}%"></div>
        </div>
      </div>
      <div class="quiz-body" id="quiz-body"></div>
      <div class="quiz-footer">
        ${this.step > 0 ? `<button class="btn btn-secondary" style="flex:1" onclick="QUIZ.back()">Back</button>` : ''}
        <button class="btn btn-primary" style="flex:2" id="quiz-next-btn" onclick="QUIZ.next()">
          ${this.step === this.steps.length - 1 ? (this.editing ? 'Save and update my names' : 'See my names ❤️') : 'Next'}
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
            <p class="hint">Pick any that feel meaningful to you, or skip to see names from everywhere.</p>
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
            <p class="hint quiz-subq">If you pick backgrounds, which names should you see?</p>
            <div class="choice-grid" id="bg-mode-grid">
              <button class="choice-pill ${this.answers.backgrounds_strict ? 'selected' : ''}"
                onclick="QUIZ.setStrict(true, this)">Only names from these backgrounds</button>
              <button class="choice-pill ${!this.answers.backgrounds_strict ? 'selected' : ''}"
                onclick="QUIZ.setStrict(false, this)">These first, then names from everywhere</button>
            </div>
          </div>`;
        break;

      case 'popular':
        body.innerHTML = `
          <div class="quiz-step active">
            <h3>Focus on the most popular names?</h3>
            <p class="hint">Choose countries to only see their most popular names: the top 200 in the United States, the top 100 elsewhere.</p>
            <div class="choice-grid">
              <button class="choice-pill ${this.answers.popular_mode === 'all' ? 'selected' : ''}"
                onclick="QUIZ.setPopularMode('all')">Show me all names</button>
              <button class="choice-pill ${this.answers.popular_mode === 'top' ? 'selected' : ''}"
                onclick="QUIZ.setPopularMode('top')">Only the most popular names</button>
            </div>
            ${this.answers.popular_mode === 'top' ? `
            <p class="hint quiz-subq">Most popular in…</p>
            <div class="choice-grid">
              ${Object.entries(POPULAR_LISTS).map(([v, list]) =>
                `<button class="choice-pill ${this.answers.popular_in.includes(v) ? 'selected' : ''}"
                  onclick="QUIZ.toggleMulti('popular_in','${v}',this)">${list.label} · top ${list.top || 100}</button>`
              ).join('')}
            </div>` : ''}
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

  setStrict(strict, el) {
    this.answers.backgrounds_strict = strict;
    el.closest('.choice-grid').querySelectorAll('.choice-pill').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  setPopularMode(mode) {
    this.answers.popular_mode = mode;
    this.renderStep();
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
    if (stepName === 'popular' && this.answers.popular_mode === 'top' && !this.answers.popular_in.length) {
      showToast('Pick at least one country, or choose "Show me all names"');
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
      sibling_names:   parseNameList(this.answers.sibling_names),
      backgrounds_strict: this.answers.backgrounds.length ? this.answers.backgrounds_strict : null,
      popular_in:      this.answers.popular_mode === 'top' && this.answers.popular_in.length ? this.answers.popular_in : null
    };

    const { data, error } = await STATE.db
      .from('preferences')
      .upsert(payload, { onConflict: 'room_id,user_id' })
      .select()
      .single();

    if (error) {
      showToast('Could not save. Please try again.');
      btn.disabled = false;
      btn.textContent = this.editing ? 'Save and update my names' : 'See my names ❤️';
      return;
    }

    STATE.myPrefs = data;

    // Already in the app: refresh the names in place and keep everything else
    if (this.editing && document.getElementById('bottom-nav').classList.contains('visible')) {
      this.editing = false;
      showMainScreen('swipe-screen');
      await refreshDeck('Your names are updated for your new answers');
      return;
    }

    // Check if partner has also done the quiz
    const { data: allPrefs } = await STATE.db
      .from('preferences')
      .select('*')
      .eq('room_id', STATE.room.id);

    STATE.partnerPrefs = allPrefs ? allPrefs.find(p => p.user_id !== STATE.user.id) || null : null;
    await enterMainApp();
  }
};
