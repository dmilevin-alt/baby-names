// ── DECK BUILDER ─────────────────────────────────────────────────────────────
// Combines two preference sets into a scored, randomized name list.

const DECK = {

  build(myPrefs, partnerPrefs) {
    const p1 = myPrefs;
    const p2 = partnerPrefs;

    // ── 1. Gender hard filter ────────────────────────────────────────────────
    let genderFilter = 'all';
    if (p1.gender_pref === p2.gender_pref) {
      genderFilter = p1.gender_pref; // both same
    } else if (p1.gender_pref === 'either') {
      genderFilter = p2.gender_pref;
    } else if (p2.gender_pref === 'either') {
      genderFilter = p1.gender_pref;
    }
    // If they disagree (girl vs boy), genderFilter stays 'all' → show everything

    // ── 2. Avoid-letters hard filter ─────────────────────────────────────────
    const avoidSet = new Set();
    parseLetters(p1.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));
    parseLetters(p2.avoid_letters).forEach(l => avoidSet.add(l.toUpperCase()));

    // ── 3. Filter ────────────────────────────────────────────────────────────
    let pool = NAMES.filter(n => {
      if (genderFilter !== 'all' && genderFilter !== 'either' &&
          n.gender !== 'either' && n.gender !== genderFilter) return false;
      if (avoidSet.size > 0 && avoidSet.has(n.name[0].toUpperCase())) return false;
      return true;
    });

    // ── 4. Score ─────────────────────────────────────────────────────────────
    const allBackgrounds = union(p1.backgrounds || [], p2.backgrounds || []);
    const allStyles      = union(p1.styles || [],      p2.styles || []);
    const allTraditions  = union(p1.tradition || [],   p2.tradition || []);
    const includeLetters = union(
      parseLetters(p1.include_letters),
      parseLetters(p2.include_letters)
    ).map(l => l.toUpperCase());

    pool = pool.map(n => {
      let score = 0;

      // Origin / cultural background (+2)
      if (allBackgrounds.length > 0 && n.origin.some(o => allBackgrounds.includes(o))) score += 2;

      // Style (+2)
      if (allStyles.length > 0 && n.style.some(s => allStyles.includes(s))) score += 2;

      // Tradition (+1)
      if (allTraditions.length === 0) {
        score += 1; // both skipped → no filter, all names get the point
      } else if (n.tradition.some(t => allTraditions.includes(t))) {
        score += 1;
      }

      // Length (+1 if either person's preference is matched)
      if (checkNameLength(p1.length_pref, n.syllables) || checkNameLength(p2.length_pref, n.syllables)) {
        score += 1;
      }

      // Include letters (+1)
      if (includeLetters.length > 0 && includeLetters.includes(n.name[0].toUpperCase())) {
        score += 1;
      }

      return { ...n, score };
    });

    // ── 5. Sort by score, then shuffle names with equal scores ───────────────
    pool.sort((a, b) => b.score - a.score);
    for (let start = 0; start < pool.length;) {
      let end = start + 1;
      while (end < pool.length && pool[end].score === pool[start].score) end++;

      for (let i = end - 1; i > start; i--) {
        const j = start + Math.floor(Math.random() * (i - start + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      start = end;
    }

    return pool;
  }
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function parseLetters(str) {
  if (!str) return [];
  return str.split(/[,\s]+/).map(s => s.trim()).filter(s => s.length === 1 && /[a-zA-Z]/.test(s));
}

function union(a, b) {
  return [...new Set([...a, ...b])];
}

function checkNameLength(pref, syllables) {
  if (!pref || pref === 'any') return true;
  if (!Number.isFinite(syllables)) return false;
  if (pref === 'short')  return syllables <= 2;
  if (pref === 'medium') return syllables >= 2 && syllables <= 3;
  if (pref === 'long')   return syllables >= 3;
  return true;
}
