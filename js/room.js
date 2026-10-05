// ── ROOM (create / join) ──────────────────────────────────────────────────────
const ROOM = {

  renderCreate() {
    const el = document.getElementById('room-screen');
    el.innerHTML = `
      <div style="display:flex;justify-content:flex-end;width:100%;padding:16px 16px 0">
        <button class="btn-logout-sm" onclick="PROFILE.logout()">Log out</button>
      </div>
      <div class="room-icon">👶</div>
      <h2>Create your room</h2>
      <p>Start a room and share the code with your partner so they can join.</p>
      <div class="room-actions">
        <button class="btn btn-primary" id="create-room-btn" onclick="ROOM.create()">
          Create a room
        </button>
        <div style="text-align:center;font-size:14px;color:var(--text-muted);padding:4px 0">or</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">
            Have a code?
          </div>
          <div class="join-input-wrap">
            <input id="join-code-input" placeholder="XXXXXX" maxlength="6" oninput="this.value=this.value.toUpperCase()">
            <button class="btn btn-secondary" id="join-btn" onclick="ROOM.join()" style="padding:0 18px;border-radius:var(--r-sm);font-weight:700">
              Join
            </button>
          </div>
        </div>
        <div id="room-error" class="auth-error" style="display:none"></div>
      </div>
    `;
  },

  // Shown once after creating a room; you can start straight away
  renderCreated(code) {
    const el = document.getElementById('room-screen');
    el.innerHTML = `
      <div style="display:flex;justify-content:flex-end;width:100%;padding:16px 16px 0">
        <button class="btn-logout-sm" onclick="PROFILE.logout()">Log out</button>
      </div>
      <div class="room-icon">🔗</div>
      <h2>Share this code</h2>
      <p>Send this code to your partner so they can join. You can start now; your matches appear once they join.</p>
      <div class="invite-code-box">
        <div class="label">Invite code</div>
        <div class="code">${code}</div>
        <div class="hint">You can also find it later in Profile</div>
      </div>
      <button class="btn btn-secondary" style="max-width:320px;width:100%" onclick="ROOM.copyCode('${code}')">
        Share code
      </button>
      <button class="btn btn-primary" style="max-width:320px;width:100%;margin-top:10px" onclick="boot()">
        Start my quiz →
      </button>
    `;
  },

  async create() {
    const btn = document.getElementById('create-room-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    // Generate a unique 6-char code
    let code, exists;
    do {
      code = Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');
      const { data } = await STATE.db
        .from('rooms')
        .select('id')
        .eq('invite_code', code)
        .maybeSingle();
      exists = !!data;
    } while (exists);

    const { data: room, error } = await STATE.db
      .from('rooms')
      .insert({ invite_code: code, created_by: STATE.user.id })
      .select()
      .single();

    if (error) {
      showRoomError('Could not create room. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Create a room';
      return;
    }

    STATE.room = room;
    ROOM.renderCreated(code);
    showScreen('room-screen');
  },

  async join() {
    const input  = document.getElementById('join-code-input');
    const code   = input ? input.value.trim().toUpperCase() : '';
    const btn    = document.getElementById('join-btn');

    if (code.length !== 6) {
      showRoomError('Please enter the full 6-character code.');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner dark" style="width:18px;height:18px;border:3px solid rgba(61,42,30,.2);border-top-color:var(--text)"></div>';

    const { data, error } = await STATE.db.rpc('join_room', { p_invite_code: code });

    if (error) {
      showRoomError(error.message || 'Could not join. Check the code and try again.');
      btn.disabled = false;
      btn.textContent = 'Join';
      return;
    }

    STATE.room = data;
    await boot(); // re-run the boot flow; room is now set
  },

  copyCode(code) {
    if (navigator.share) {
      navigator.share({
        title: 'Join my Baby Names room',
        text: `Use code ${code} to join my Baby Names game!`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(code)
        .then(() => showToast('Code copied! ✓'))
        .catch(() => showToast('Code: ' + code));
    }
  }
};

function showRoomError(msg) {
  let el = document.getElementById('room-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
