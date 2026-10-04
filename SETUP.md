# Setup Guide — Baby Names App

You only need to do this once. Each step below tells you exactly what to click.

---

## Step 1 — Create a Supabase account and project

Supabase is the free backend service that stores your data.

1. Open your browser and go to **supabase.com**
2. Click **Start your project** → sign up with GitHub or email
3. Once logged in, click **New project**
4. Fill in:
   - **Organization**: your name (e.g. "Dmitry Levin")
   - **Project name**: Baby Names
   - **Database password**: choose something strong — save it somewhere safe
   - **Region**: pick the one closest to you (e.g. US East, EU West)
5. Click **Create new project** — it takes about 1 minute to spin up

---

## Step 2 — Run the database setup

This creates all the tables and privacy rules in one go.

1. In your Supabase project, look at the left sidebar and click **SQL Editor**
2. Click **New query** (top left of the editor)
3. Open the file `supabase/schema.sql` from this project folder
4. Select all the text (Cmd+A on Mac), copy it (Cmd+C)
5. Paste it (Cmd+V) into the Supabase SQL editor
6. Click the green **Run** button (or press Cmd+Enter)
7. You should see "Success. No rows returned" at the bottom — that means it worked

---

## Step 3 — Turn off email confirmation (recommended for easy testing)

By default Supabase asks users to click a confirmation email before they can log in. For a private family app, you can skip this.

1. In the left sidebar click **Authentication** → **Providers**
2. Under **Email**, find the toggle for **Confirm email**
3. Turn it **OFF**
4. Click **Save**

> If you want to keep email confirmation ON, that works too — each user will just need to check their email after signing up before they can log in.

---

## Step 4 — Set the allowed redirect URL (only needed if email confirmation is ON)

If you turned off email confirmation above, skip this step.

If you kept it ON, you need to tell Supabase where to send users after they click the confirmation link.

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Under **Site URL**, enter: `https://YOUR-GITHUB-USERNAME.github.io/baby-names/`
   (You'll know your final URL after Step 6)
3. Under **Redirect URLs**, add: `https://YOUR-GITHUB-USERNAME.github.io/baby-names/index.html`
4. Click **Save**

---

## Step 5 — Copy your Supabase keys into the app

1. In Supabase, click **Project Settings** (gear icon in the bottom left sidebar)
2. Click **API** in the settings menu
3. You'll see two values:
   - **Project URL** — looks like `https://xyzabcdef.supabase.co`
   - **anon public** key — a long string starting with `eyJ…`

4. Open the file `config.js` in this project folder (just a text file — open with any text editor)
5. Replace `YOUR_SUPABASE_URL_HERE` with your Project URL
6. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your anon public key
7. Save the file

The file should look like this when done:
```js
const SUPABASE_URL  = 'https://xyzabcdef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## Step 6 — Put the app on GitHub Pages

GitHub Pages hosts your app for free. You need a free GitHub account.

### 6a — Create a GitHub account (if you don't have one)
Go to **github.com** → Sign up

### 6b — Create a new repository
1. Once logged in, click the **+** icon (top right) → **New repository**
2. Name it: `baby-names`
3. Make sure it is set to **Public** (required for free GitHub Pages)
4. **Do not** check "Add a README file"
5. Click **Create repository**

### 6c — Upload your files
1. On the empty repository page, you'll see a link that says **uploading an existing file** — click it
2. Drag your entire project folder's contents into the upload area:
   - `index.html`
   - `app.html`
   - `config.js`
   - `names.js`
   - `manifest.json`
   - `icon.svg`
   - The `css/` folder (drag the whole folder)
   - The `js/` folder (drag the whole folder)
   - The `supabase/` folder (drag the whole folder)
   - `SETUP.md`
3. Scroll down, add a message like "Initial upload", click **Commit changes**

> **Note:** GitHub's upload UI doesn't always accept entire folders at once. If it fails, try uploading the files in groups, or use the GitHub Desktop app (free, easy to install).

### 6d — Enable GitHub Pages
1. In your repository, click **Settings** (top tab bar)
2. In the left sidebar, click **Pages**
3. Under **Source**, choose **Deploy from a branch**
4. Under **Branch**, choose **main** and **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes, then refresh. You'll see: "Your site is live at `https://YOUR-USERNAME.github.io/baby-names/`"

---

## Step 7 — Add the app icon (optional but nice)

The `icon.svg` file is used as the app icon. For the best iOS home screen experience, you need a PNG version.

**Easy option:** Use an online SVG-to-PNG converter.
1. Go to **cloudconvert.com/svg-to-png**
2. Upload `icon.svg`
3. Set size to 512×512
4. Download the result as `icon-512.png`
5. Make a second copy, resize it to 192×192, save as `icon-192.png`
6. Upload both PNG files to your GitHub repository (Settings → the root folder)

**Quick option:** Just leave it as SVG — most modern Android phones support SVG icons. The app will still be installable.

---

## Step 8 — Install on your phones

### Android (Chrome)
1. Open Chrome and go to your app URL
2. Tap the **⋮** menu (three dots, top right)
3. Tap **Add to Home screen**
4. Tap **Add**

### iPhone (Safari)
1. Open Safari (must be Safari, not Chrome) and go to your app URL
2. Tap the **Share** button (the box with an arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

---

## Step 9 — Test the full flow

1. Open the app on your phone → sign up with your email
2. Create a room → share the 6-character code with your wife
3. Your wife opens the app → signs up → joins using the code
4. Both complete the quiz (each on your own phone)
5. Both start swiping
6. Love the same name → you'll see the celebration screen!

---

## Troubleshooting

**"YOUR_SUPABASE_URL_HERE" error**: You forgot to fill in `config.js` — see Step 5.

**"Access denied" or blank screen**: Open browser dev tools (F12 → Console) and look for red error messages. Usually means the schema wasn't run correctly — try Step 2 again.

**"Room not found" when joining**: Make sure the code is exactly 6 characters, all uppercase. The person who created the room must have already created it (check they're past the room screen).

**Swipe not working on phone**: Make sure you installed from Safari (iOS) or Chrome (Android). Open in Safari/Chrome first, then add to home screen.

**Names not appearing**: Both people must finish the quiz before swiping begins. The app will show a "waiting" screen until your partner finishes.

---

## Files at a glance

| File | What it is |
|---|---|
| `config.js` | **Edit this.** Your Supabase URL + key |
| `index.html` | Login / Sign-up page |
| `app.html` | Main app (all screens in one page) |
| `names.js` | 1,400+ name database |
| `popular-names.js` | Official 2025 baby-name rankings for Canada, UK jurisdictions, France, Ireland, New Zealand, and Australian states |
| `official-baby-names-top-100.json` | Source ranks, counts, and URLs for Canada, France, Ireland, Northern Ireland, New Zealand, Scotland, and England and Wales |
| `css/style.css` | All visual styles |
| `js/app.js` | Global state + screen routing |
| `js/auth.js` | Login / sign-up logic |
| `js/room.js` | Create / join couple room |
| `js/quiz.js` | Preferences quiz |
| `js/deck.js` | Name scoring + sorting |
| `js/swipe.js` | Swipe card + voting |
| `js/shortlist.js` | Mutual matches screen |
| `supabase/schema.sql` | Paste into Supabase SQL Editor |
| `manifest.json` | Makes app installable |
| `icon.svg` | App icon |
