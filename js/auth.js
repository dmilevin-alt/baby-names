// ── Auth (index.html) ─────────────────────────────────────────────────────────
let db;

document.addEventListener('DOMContentLoaded', async () => {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Already logged in? go straight to app
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.href = './app.html?v=' + Date.now();
  }
});

// Switch between Login / Sign-up tabs
function switchTab(tab) {
  document.getElementById('login-form').style.display  = tab === 'login'  ? '' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('tab-login').classList.toggle('active',  tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
}

// ── LOG IN ───────────────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.classList.remove('visible');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    errEl.textContent = friendlyError(error.message);
    errEl.classList.add('visible');
    btn.disabled = false;
    btn.textContent = 'Log in';
    return;
  }

  window.location.href = './app.html?v=' + Date.now();
}

// ── SIGN UP ──────────────────────────────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl    = document.getElementById('signup-error');
  const sucEl    = document.getElementById('signup-success');
  const btn      = document.getElementById('signup-btn');

  errEl.classList.remove('visible');
  sucEl.classList.remove('visible');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } }
  });

  if (error) {
    errEl.textContent = friendlyError(error.message);
    errEl.classList.add('visible');
    btn.disabled = false;
    btn.textContent = 'Create account';
    return;
  }

  // If email confirmation is OFF in Supabase, session is returned immediately
  if (data.session) {
    // Update profile display_name (trigger creates it with email prefix; override with real name)
    await db.from('profiles').upsert({ id: data.user.id, display_name: name });
    window.location.href = './app.html?v=' + Date.now();
    return;
  }

  // Email confirmation is ON — show message
  sucEl.textContent = '✅ Check your email and click the confirmation link, then come back and log in!';
  sucEl.classList.add('visible');
  btn.disabled = false;
  btn.textContent = 'Create account';
}

function friendlyError(msg) {
  if (/invalid login/i.test(msg))        return 'Wrong email or password.';
  if (/already registered/i.test(msg))   return 'An account with that email already exists.';
  if (/password.*characters/i.test(msg)) return 'Password must be at least 6 characters.';
  if (/email.*invalid/i.test(msg))       return 'Please enter a valid email address.';
  return msg;
}
