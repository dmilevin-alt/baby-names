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
    // Cultural backgrounds from either partner rank names first; with "Only these
    // backgrounds" other names are left out. "Most popular" keeps only top names.
    const allowed = allowedOrigins(union(p1.backgrounds || [], p2.backgrounds || []));
    const strict  = strictBackgrounds(p1, p2);
    const popular = popularFilter(p1, p2);
    let pool = NAMES.filter(n => {
      if (!fitsGender(n, genderFilter)) return false;
      if (!fitsBackgrounds(n, strict)) return false;
      if (!fitsPopular(n, popular)) return false;
      if (avoidSet.size > 0 && avoidSet.has(n.name[0].toUpperCase())) return false;
      return true;
    });

    // ── 4. Score ─────────────────────────────────────────────────────────────
    const allStyles      = union(p1.styles || [],      p2.styles || []);
    const allTraditions  = union(p1.tradition || [],   p2.tradition || []);
    const includeLetters = union(
      parseLetters(p1.include_letters),
      parseLetters(p2.include_letters)
    ).map(l => l.toUpperCase());

    pool = pool.map(n => {
      let score = 0;

      // Origin / cultural background (+2)
      if (allowed && n.origin.some(o => allowed.has(o))) score += 2;

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
    // Within a score, the app's own names come first (shuffled), then names that
    // are only in the US Social Security list, most common first
    pool.sort((a, b) => b.score - a.score || (a.usOnly ? 1 : 0) - (b.usOnly ? 1 : 0));
    for (let start = 0; start < pool.length;) {
      let end = start + 1;
      while (end < pool.length && pool[end].score === pool[start].score && !pool[end].usOnly === !pool[start].usOnly) end++;

      if (pool[start].usOnly) {
        const group = pool.slice(start, end).sort((a, b) => usBirths(b) - usBirths(a));
        pool.splice(start, group.length, ...group);
      } else {
        for (let i = end - 1; i > start; i--) {
          const j = start + Math.floor(Math.random() * (i - start + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
      }
      start = end;
    }

    return pool;
  }
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
// The origins each quiz background covers
const BACKGROUND_ORIGINS = {
  hebrew:       ['hebrew'],
  ukrainian:    ['ukrainian'],
  russian:      ['russian'],
  persian:      ['persian'],
  english:      ['english', 'old english'],
  french:       ['french'],
  arabic:       ['arabic'],
  slavic:       ['slavic', 'polish'],
  greek:        ['greek'],
  latin:        ['latin', 'italian'],
  spanish:      ['spanish', 'basque'],
  scandinavian: ['scandinavian'],
  irish:        ['irish', 'celtic', 'scottish', 'welsh', 'cornish'],
  german:       ['german', 'dutch'],
  hindi:        ['hindi', 'sanskrit'],
  japanese:     ['japanese'],
};

// Origins allowed by the chosen backgrounds; null means no background was chosen
function allowedOrigins(backgrounds) {
  if (!backgrounds || backgrounds.length === 0) return null;
  return new Set(backgrounds.flatMap(b => BACKGROUND_ORIGINS[b] || [b]));
}

// Does a name come from one of the allowed origins? (null allows everything)
function fitsBackgrounds(n, allowed) {
  return !allowed || (n.origin || []).some(o => allowed.has(o));
}

// Origins a name must come from: only when a partner chose "Only these backgrounds".
// Both partners' backgrounds count. null = no background filter.
function strictBackgrounds(p1, p2) {
  const strict = Boolean(p1?.backgrounds_strict || p2?.backgrounds_strict);
  return strict ? allowedOrigins(union(p1?.backgrounds || [], p2?.backgrounds || [])) : null;
}

// Countries whose most popular names the quiz can focus on. The US list is the full SSA
// ranking (top 200); the others are official top-100 lists.
const POPULAR_LISTS = {
  us:          { label: 'United States', top: 200 },
  canada:      { label: 'Canada', jurisdiction: 'Canada' },
  england:     { label: 'England & Wales', jurisdiction: 'England and Wales' },
  scotland:    { label: 'Scotland', jurisdiction: 'Scotland' },
  ireland:     { label: 'Ireland', jurisdiction: 'Ireland' },
  ni:          { label: 'Northern Ireland', jurisdiction: 'Northern Ireland' },
  australia:   { label: 'Australia', jurisdiction: 'Australia' },   // any state's list
  nz:          { label: 'New Zealand', jurisdiction: 'New Zealand' },
  france:      { label: 'France', jurisdiction: 'France' },
};

// Countries chosen by either partner; null = all names
function popularFilter(p1, p2) {
  const chosen = union(p1?.popular_in || [], p2?.popular_in || []).filter(c => POPULAR_LISTS[c]);
  return chosen.length ? chosen : null;
}

// Is the name among the most popular in one of the chosen countries?
function fitsPopular(n, countries) {
  if (!countries) return true;
  return countries.some(c => {
    const list = POPULAR_LISTS[c];
    if (c === 'us') {
      return (n.us?.girls?.rank || Infinity) <= list.top || (n.us?.boys?.rank || Infinity) <= list.top;
    }
    return (n.popularIn || []).some(p => p.jurisdiction.startsWith(list.jurisdiction));
  });
}

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
