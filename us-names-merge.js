// Merge the US Social Security baby-name list (us-names.js) into NAMES.
// Names already in the app get their US rank and birth count; new names are added
// once (case-insensitive, and an accent variant of an existing name isn't added again).
(function mergeUsNames() {
  const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const byKey  = new Map(NAMES.map(n => [n.name.toLowerCase(), n]));
  const folded = new Set(NAMES.map(n => fold(n.name)));

  // name → { name, girls: { births, rank }, boys: { births, rank } }
  const stats = new Map();
  for (const sex of ['girls', 'boys']) {
    let rank = 0, prevBirths = -1;
    US_NAMES[sex].split(',').forEach((item, i) => {
      const [name, count] = item.split(':');
      const births = Number(count);
      if (births !== prevBirths) { rank = i + 1; prevBirths = births; }   // ties share a rank, like SSA
      const key = name.toLowerCase();
      const s = stats.get(key) || { name };
      s[sex] = { births, rank };
      stats.set(key, s);
    });
  }

  let added = 0;
  for (const [key, s] of stats) {
    let entry = byKey.get(key);
    if (!entry) {
      if (folded.has(fold(s.name))) continue;
      const g = s.girls?.births || 0, b = s.boys?.births || 0;
      entry = {
        name: s.name,
        gender: Math.min(g, b) >= 0.2 * (g + b) ? 'either' : g > b ? 'girl' : 'boy',
        origin: [], tradition: [], style: [], meaning: '', syllables: null,
        usOnly: true,
      };
      NAMES.push(entry);
      byKey.set(key, entry);
      added++;
    }
    entry.us = { year: US_NAMES.year, girls: s.girls || null, boys: s.boys || null };
    for (const sex of ['girls', 'boys']) {
      if (s[sex] && s[sex].rank <= 100) {
        entry.popularIn = entry.popularIn || [];
        entry.popularIn.push({ jurisdiction: 'United States', year: US_NAMES.year, gender: sex, position: s[sex].rank });
      }
    }
  }
  US_NAMES.added = added;
})();

// The US figures that fit the name: its own gender, or the more common one for unisex names
function usStat(n) {
  const us = n?.us;
  if (!us) return null;
  const pick = n.gender === 'girl' ? 'girls' : n.gender === 'boy' ? 'boys'
    : ((us.girls?.births || 0) >= (us.boys?.births || 0) ? 'girls' : 'boys');
  const s = us[pick] || us.girls || us.boys;
  return s ? { ...s, gender: us[pick] ? pick : (us.girls ? 'girls' : 'boys'), year: us.year } : null;
}

// Top-100 rankings plus the name's full US rank when it's outside the US top 100,
// best first: [{ jurisdiction, year, gender, position }]
function popularityList(n) {
  const list = [...(n?.popularIn || [])];
  const us = usStat(n);
  if (us && us.rank > 100) list.push({ jurisdiction: 'United States', year: us.year, gender: us.gender, position: us.rank });
  return list.sort((a, b) => a.position - b.position);
}

// Does a name belong in a girls' or boys' list? Unisex names count only when at least
// 20% of US babies with the name are that sex, so mostly-boy names such as Kai or Ryan
// stay out of girls' lists. Names with little US data (under 20 babies) keep counting.
function fitsGender(n, gender) {
  if (gender !== 'girl' && gender !== 'boy') return true;
  if (n.gender === gender) return true;
  if (n.gender !== 'either') return false;
  const g = n.us?.girls?.births || 0, b = n.us?.boys?.births || 0;
  if (g + b < 20) return true;
  return (gender === 'girl' ? g : b) / (g + b) >= 0.2;
}

function usBirths(n) {
  return Math.max(n?.us?.girls?.births || 0, n?.us?.boys?.births || 0);
}
