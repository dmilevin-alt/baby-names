// Merge names that differ only by accents (e.g. Leo / Léo, Oisín / Oisin) into one entry.
// Keeps the better-described spelling (or the accented native spelling when both are
// equal), carries over the other's rankings, and remembers the dropped spelling so
// votes cast on it still count (see MERGED_SPELLINGS in app.js).
const MERGED_SPELLINGS = {};   // dropped spelling → kept spelling

(function mergeAccentDuplicates() {
  const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const hasAccent = s => s !== s.normalize('NFD').replace(/\p{M}/gu, '');
  const groups = new Map();
  for (const n of NAMES) {
    const k = fold(n.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(n);
  }

  const drop = new Set();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const score = n => (n.meaning ? 4 : 0) + ((n.origin || []).length ? 2 : 0) + (n.usOnly ? 0 : 1) + (hasAccent(n.name) ? 0.5 : 0);
    const [keep, ...rest] = [...group].sort((a, b) => score(b) - score(a));
    keep._originalName = keep.name;
    for (const other of rest) {
      for (const r of other.popularIn || []) {
        keep.popularIn = keep.popularIn || [];
        if (!keep.popularIn.some(p => p.jurisdiction === r.jurisdiction && p.gender === r.gender)) keep.popularIn.push(r);
      }
      if (!keep.us && other.us) keep.us = other.us;
      if (!keep.meaning && other.meaning) keep.meaning = other.meaning;
      if (!(keep.origin || []).length && (other.origin || []).length) keep.origin = other.origin;
      if (!Number.isFinite(keep.syllables) && Number.isFinite(other.syllables)) keep.syllables = other.syllables;
      if (keep.gender !== other.gender && !other.usOnly) keep.gender = 'either';
      if (!NICKNAMES[keep.name] && NICKNAMES[other.name]) NICKNAMES[keep.name] = NICKNAMES[other.name];
      drop.add(other);
    }
    // Show the unaccented spelling when it's the one common in the US (Raphael, Sean)
    const usSpelling = group.find(n => !hasAccent(n.name) && Math.min(n.us?.girls?.rank || Infinity, n.us?.boys?.rank || Infinity) <= 1000);
    if (usSpelling && usSpelling !== keep) {
      if (NICKNAMES[keep.name] && !NICKNAMES[usSpelling.name]) NICKNAMES[usSpelling.name] = NICKNAMES[keep.name];
      keep.name = usSpelling.name;
    }
    for (const n of group) {
      if (n !== keep && n.name !== keep.name) MERGED_SPELLINGS[n.name] = keep.name;
    }
    const original = group.find(n => n === keep);
    if (original._originalName && original._originalName !== keep.name) MERGED_SPELLINGS[original._originalName] = keep.name;
  }
  for (let i = NAMES.length - 1; i >= 0; i--) {
    if (drop.has(NAMES[i])) NAMES.splice(i, 1);
  }
})();
