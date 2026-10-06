// Combine names that are the same name spelled differently (Aiden / Ayden,
// Sarah / Sara, Caden / Kaden, Ashley / Ashlee / Ashleigh) into one entry.
// The kept entry lists the other spellings, carries over their rankings and details,
// and votes cast on a merged spelling still count (MERGED_SPELLINGS).
//
// Spellings match when they differ only by: accents; ph/f; ck/k; c/k before a, o, u;
// xs/x; doubled consonants (except right before a -y/-ie ending); ay/ai and ey/ei; -yn/-in; the endings -y/-ie/-ee/-ey/-eigh;
// or a final h. To avoid merging different names that look alike:
//   - only names of the same gender merge (unisex spellings join a one-gender group)
//   - two names with their own, different meanings stay separate (Noa / Noah)
(function mergeSpellingVariants() {
  // Short names ending in a plain -i (Kali, Dani) sound different from -y/-ee spellings
  const spellingKey = s => baseKey(s) + (/^[a-z]{1,3}i$/i.test(s.normalize('NFD').replace(/\p{M}/gu, '')) ? '#' : '');
  const baseKey = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/['\- ]/g, '')
    .replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/c(?=[aou])/g, 'k').replace(/xs/g, 'x')
    // A doubled consonant right before a -y/-ie ending changes the sound (Callie vs Kaley)
    .replace(/([^aeiou])\1+(?!(eigh|ey|ie|ee|y|i)$)/g, '$1')
    .replace(/ay/g, 'ai').replace(/ey(?=.)/g, 'ei').replace(/yn/g, 'in')
    .replace(/(eigh|ey|ie|ee|y)$/, 'i')
    .replace(/h$/, '');
  const sameMeaning = (a, b) => !a.meaning || !b.meaning ||
    a.meaning.toLowerCase().replace(/[^a-z]/g, '') === b.meaning.toLowerCase().replace(/[^a-z]/g, '');
  const births = n => (n.us?.girls?.births || 0) + (n.us?.boys?.births || 0);

  const groups = new Map();
  for (const n of NAMES) {
    const k = spellingKey(n.name);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(n);
  }

  const drop = new Set();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const by = { girl: [], boy: [], either: [] };
    group.forEach(n => by[n.gender].push(n));
    const buckets = by.girl.length && by.boy.length
      ? [by.girl, by.boy, by.either]
      : [[...by.girl, ...by.boy, ...by.either]];

    for (const bucket of buckets) {
      if (bucket.length < 2) continue;
      // Keep the best-described, most common spelling
      bucket.sort((a, b) => (b.meaning ? 1 : 0) - (a.meaning ? 1 : 0) ||
        (a.usOnly ? 1 : 0) - (b.usOnly ? 1 : 0) || births(b) - births(a) || a.name.length - b.name.length);
      const keep = bucket[0];
      for (const other of bucket.slice(1)) {
        if (!sameMeaning(keep, other)) continue;
        keep.spellings = [...new Set([...(keep.spellings || []), other.name, ...(other.spellings || [])])];
        for (const r of other.popularIn || []) {
          keep.popularIn = keep.popularIn || [];
          if (!keep.popularIn.some(p => p.jurisdiction === r.jurisdiction && p.gender === r.gender)) keep.popularIn.push(r);
        }
        if (!keep.us && other.us) keep.us = other.us;
        if (!keep.meaning && other.meaning) keep.meaning = other.meaning;
        if (!(keep.origin || []).length && (other.origin || []).length) keep.origin = other.origin;
        if (!(keep.tradition || []).length && (other.tradition || []).length) keep.tradition = other.tradition;
        if (!Number.isFinite(keep.syllables) && Number.isFinite(other.syllables)) keep.syllables = other.syllables;
        if ((other.style || []).length) keep.style = [...new Set([...(keep.style || []), ...other.style])];
        if (other.famous) keep.famous = [...(keep.famous || []), ...other.famous.filter(f => !(keep.famous || []).some(k => k.who === f.who))];
        if (!other.usOnly) delete keep.usOnly;
        if (!NICKNAMES[keep.name] && NICKNAMES[other.name]) NICKNAMES[keep.name] = NICKNAMES[other.name];
        MERGED_SPELLINGS[other.name] = keep.name;
        drop.add(other);
      }
    }
  }

  // Earlier aliases that pointed at a now-merged spelling point at the kept one
  for (const [from, to] of Object.entries(MERGED_SPELLINGS)) {
    let target = to;
    for (let hops = 0; MERGED_SPELLINGS[target] && MERGED_SPELLINGS[target] !== target && hops < 10; hops++) {
      target = MERGED_SPELLINGS[target];
    }
    MERGED_SPELLINGS[from] = target;
  }

  for (let i = NAMES.length - 1; i >= 0; i--) {
    if (drop.has(NAMES[i])) NAMES.splice(i, 1);
  }
  MERGED_SPELLINGS_COUNT = drop.size;
})();
var MERGED_SPELLINGS_COUNT;

// Look a name up by its spelling, ignoring case, including spellings merged into another
const NAMES_BY_KEY = new Map();
function findName(name) {
  if (!name) return null;
  if (NAMES_BY_KEY.size !== NAMES.length) {
    NAMES_BY_KEY.clear();
    for (const n of NAMES) NAMES_BY_KEY.set(n.name.toLowerCase(), n);
  }
  const key = String(name).toLowerCase();
  if (NAMES_BY_KEY.has(key)) return NAMES_BY_KEY.get(key);
  const alias = Object.keys(MERGED_SPELLINGS).find(k => k.toLowerCase() === key);
  return alias ? NAMES_BY_KEY.get(MERGED_SPELLINGS[alias].toLowerCase()) || null : null;
}
