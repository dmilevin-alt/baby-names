// Common Persian / Iranian names. Adds the ones the app doesn't have yet and fills in
// details for names that were only in the US Social Security list. Names the app already
// describes are left as they are, and spelling variants already in the app aren't repeated.
// Format: Name: [gender, origin, meaning, syllables, style, nicknames]
const PERSIAN_NAMES = {
  // ── Girls ──
  Afsaneh:   ['girl', ['persian'], 'legend, fairy tale', 3, ['classic'], []],
  Afsoon:    ['girl', ['persian'], 'charm, enchantment', 2, ['unique'], []],
  Arezoo:    ['girl', ['persian'], 'wish, hope', 3, ['classic'], []],
  Atoosa:    ['girl', ['persian'], 'well-pleasing; name of an ancient Persian queen (Atossa)', 3, ['vintage', 'unique'], []],
  Azar:      ['girl', ['persian'], 'fire', 2, ['classic'], []],
  Bahareh:   ['girl', ['persian'], 'of the spring', 3, ['nature'], []],
  Banafsheh: ['girl', ['persian'], 'violet (the flower)', 3, ['nature'], []],
  Behnaz:    ['girl', ['persian'], 'the best grace', 2, ['classic'], []],
  Delaram:   ['girl', ['persian'], "heart's comfort, beloved", 3, ['unique'], []],
  Donya:     ['girl', ['persian', 'arabic'], 'the world', 2, ['modern'], []],
  Elaheh:    ['girl', ['persian', 'arabic'], 'goddess', 3, ['classic'], []],
  Elnaz:     ['girl', ['persian'], 'pride of the homeland', 2, ['modern'], []],
  Fatemeh:   ['girl', ['arabic', 'persian'], 'Persian form of Fatima, daughter of the Prophet Muhammad', 3, ['classic'], [], ['muslim', 'secular']],
  Fereshteh: ['girl', ['persian'], 'angel', 3, ['classic'], []],
  Firouzeh:  ['girl', ['persian'], 'turquoise', 3, ['nature'], []],
  Ghazal:    ['girl', ['persian', 'arabic'], 'love poem; gazelle', 2, ['classic'], []],
  Goli:      ['girl', ['persian'], 'like a flower', 2, ['nature', 'vintage'], []],
  Golnar:    ['girl', ['persian'], 'pomegranate blossom', 2, ['nature'], []],
  Golshan:   ['girl', ['persian'], 'rose garden', 2, ['nature'], []],
  Haleh:     ['girl', ['persian'], 'halo of light around the moon', 2, ['classic'], []],
  Hasti:     ['girl', ['persian'], 'existence, being', 2, ['modern'], []],
  Homa:      ['girl', ['persian'], 'the mythical bird of good fortune', 2, ['vintage'], []],
  Jaleh:     ['girl', ['persian'], 'dew', 2, ['nature', 'vintage'], []],
  Katayoun:  ['girl', ['persian'], 'a queen in the Shahnameh, the Persian Book of Kings', 3, ['unique'], ['Kati']],
  Khatereh:  ['girl', ['persian', 'arabic'], 'memory', 3, ['vintage'], []],
  Kimia:     ['girl', ['persian'], 'alchemy; something rare and precious', 3, ['modern'], []],
  Ladan:     ['girl', ['persian'], 'a fragrant flowering plant', 2, ['nature'], []],
  Laleh:     ['girl', ['persian'], 'tulip', 2, ['nature'], []],
  Mahin:     ['girl', ['persian'], 'of the moon', 2, ['classic'], []],
  Mahnaz:    ['girl', ['persian'], 'pride of the moon', 2, ['classic'], []],
  Mahshid:   ['girl', ['persian'], 'moonlight', 2, ['classic'], []],
  Mahtab:    ['girl', ['persian'], 'moonlight', 2, ['classic', 'nature'], []],
  Marjan:    ['girl', ['persian'], 'coral', 2, ['nature'], []],
  Mehrnaz:   ['girl', ['persian'], 'grace of kindness; pride of the sun', 2, ['modern'], []],
  Mina:      ['girl', ['persian'], 'azure, blue enamel', 2, ['classic'], []],
  Minoo:     ['girl', ['persian'], 'paradise, heaven', 2, ['classic'], []],
  Mitra:     ['girl', ['persian'], 'friendship, covenant; the ancient angel of light', 2, ['classic'], []],
  Mojgan:    ['girl', ['persian'], 'eyelashes', 2, ['vintage'], []],
  Nahid:     ['girl', ['persian'], 'Venus; the water goddess Anahita', 2, ['vintage'], []],
  Narges:    ['girl', ['persian'], 'narcissus (the flower)', 2, ['nature'], []],
  Nasim:     ['either', ['persian', 'arabic'], 'gentle breeze', 2, ['nature'], []],
  Nazanin:   ['girl', ['persian'], 'sweet, delicate, graceful', 3, ['classic'], ['Nazi']],
  Negar:     ['girl', ['persian'], 'beloved; a beautiful picture', 2, ['classic'], []],
  Pantea:    ['girl', ['persian'], 'strong; a noblewoman of ancient Persia', 3, ['unique'], []],
  Parastoo:  ['girl', ['persian'], 'swallow (the bird)', 3, ['nature'], []],
  Pari:      ['girl', ['persian'], 'fairy', 2, ['vintage'], []],
  Parvaneh:  ['girl', ['persian'], 'butterfly', 3, ['nature'], []],
  Pegah:     ['girl', ['persian'], 'dawn, daybreak', 2, ['modern'], []],
  Raha:      ['girl', ['persian'], 'free', 2, ['modern'], []],
  Roshanak:  ['girl', ['persian'], 'little star, bright light (the original of Roxana)', 3, ['vintage', 'unique'], []],
  Saba:      ['girl', ['persian', 'arabic'], 'gentle morning breeze', 2, ['classic', 'nature'], []],
  Sahar:     ['girl', ['persian', 'arabic'], 'dawn', 2, ['classic'], []],
  Sanaz:     ['girl', ['persian'], 'graceful, delicate', 2, ['modern'], []],
  Sarvenaz:  ['girl', ['persian'], 'graceful cypress tree', 3, ['nature', 'unique'], []],
  Sepideh:   ['girl', ['persian'], 'dawn, first light', 3, ['classic'], []],
  Shadi:     ['girl', ['persian'], 'happiness, joy', 2, ['modern'], []],
  Shahrzad:  ['girl', ['persian'], 'city-born; the storyteller of One Thousand and One Nights (Scheherazade)', 2, ['classic', 'unique'], []],
  Shiva:     ['girl', ['persian'], 'eloquent, charming', 2, ['modern'], []],
  Shokoufeh: ['girl', ['persian'], 'blossom', 3, ['nature'], []],
  Simin:     ['girl', ['persian'], 'silvery', 2, ['vintage'], []],
  Tahmineh:  ['girl', ['persian'], 'strong; heroine of the Shahnameh, mother of Sohrab', 3, ['vintage', 'unique'], []],
  Taraneh:   ['girl', ['persian'], 'song, melody', 3, ['classic'], []],
  Termeh:    ['girl', ['persian'], 'a fine hand-woven Persian silk cloth', 2, ['unique'], []],
  Yalda:     ['girl', ['persian'], 'the longest night of the year, celebrated at the winter solstice', 2, ['unique'], []],
  Yasaman:   ['girl', ['persian'], 'jasmine', 3, ['nature'], []],
  Zeinab:    ['girl', ['arabic', 'persian'], 'fragrant flower; name of the Prophet Muhammad\'s granddaughter', 2, ['classic'], [], ['muslim', 'secular']],
  Ziba:      ['girl', ['persian'], 'beautiful', 2, ['classic'], []],

  // ── Boys ──
  Afshin:    ['boy', ['persian'], 'name of a famous Persian general', 2, ['classic'], []],
  Ardavan:   ['boy', ['persian'], 'holy, righteous; name of Parthian kings', 3, ['unique'], []],
  Ardeshir:  ['boy', ['persian'], 'righteous ruler; founder of the Sasanian empire', 3, ['vintage'], []],
  Arman:     ['boy', ['persian'], 'wish, ideal, hope', 2, ['modern'], []],
  Arsalan:   ['boy', ['persian'], 'lion', 3, ['classic'], []],
  Aryan:     ['boy', ['persian', 'sanskrit'], 'noble', 3, ['modern'], []],
  Ashkan:    ['boy', ['persian'], 'founder of the Parthian dynasty', 2, ['unique'], []],
  Bahman:    ['boy', ['persian'], 'good mind; a month of the Persian calendar', 2, ['vintage'], []],
  Bahram:    ['boy', ['persian'], 'victorious', 2, ['classic'], []],
  Bardia:    ['boy', ['persian'], 'exalted; a prince of ancient Persia', 3, ['unique'], []],
  Behrouz:   ['boy', ['persian'], 'fortunate, prosperous', 2, ['vintage'], []],
  Behzad:    ['boy', ['persian'], 'well-born; a celebrated Persian painter', 2, ['classic'], []],
  Bijan:     ['boy', ['persian'], 'a hero of the Shahnameh', 2, ['classic'], []],
  Danial:    ['boy', ['persian', 'hebrew'], 'Persian form of Daniel: God is my judge', 3, ['classic'], ['Dani']],
  Ehsan:     ['boy', ['arabic', 'persian'], 'kindness, charity', 2, ['classic'], [], ['muslim', 'secular']],
  Faramarz:  ['boy', ['persian'], 'a hero of the Shahnameh, son of Rostam', 3, ['unique'], []],
  Farhad:    ['boy', ['persian'], 'helper; the legendary lover of Shirin', 2, ['classic'], []],
  Farshid:   ['boy', ['persian'], 'divine light', 2, ['classic'], []],
  Farzad:    ['boy', ['persian'], 'of glorious birth', 2, ['classic'], []],
  Hooman:    ['boy', ['persian'], 'good-natured, kind', 2, ['modern'], []],
  Hossein:   ['boy', ['arabic', 'persian'], 'good, handsome; grandson of the Prophet Muhammad', 2, ['classic'], [], ['muslim', 'secular']],
  Houshang:  ['boy', ['persian'], 'wise; a legendary king of the Shahnameh', 2, ['vintage'], []],
  Iman:      ['either', ['arabic', 'persian'], 'faith', 2, ['classic'], [], ['muslim', 'secular']],
  Iraj:      ['boy', ['persian'], 'a prince of the Shahnameh', 2, ['vintage'], []],
  Jamshid:   ['boy', ['persian'], 'radiant Jam; a legendary king of Persia', 2, ['classic'], []],
  Javad:     ['boy', ['arabic', 'persian'], 'generous', 2, ['classic'], [], ['muslim', 'secular']],
  Kambiz:    ['boy', ['persian'], 'Persian form of Cambyses, an Achaemenid king', 2, ['vintage'], []],
  Kamyar:    ['boy', ['persian'], 'successful, one who gets their wish', 2, ['modern'], []],
  Kasra:     ['boy', ['persian'], 'a famous Sasanian king (Khosrow)', 2, ['classic'], []],
  Keyvan:    ['boy', ['persian'], 'Saturn', 2, ['classic'], []],
  Khosrow:   ['boy', ['persian'], 'of good fame; a famous Sasanian king', 2, ['vintage'], []],
  Kian:      ['boy', ['persian'], 'king, royal', 2, ['modern'], []],
  Majid:     ['boy', ['arabic', 'persian'], 'glorious', 2, ['classic'], [], ['muslim', 'secular']],
  Mani:      ['boy', ['persian'], 'thought, mind', 2, ['modern'], []],
  Masoud:    ['boy', ['arabic', 'persian'], 'fortunate, happy', 2, ['classic'], [], ['muslim', 'secular']],
  Mehdi:     ['boy', ['arabic', 'persian'], 'rightly guided', 2, ['classic'], [], ['muslim', 'secular']],
  Mehrdad:   ['boy', ['persian'], 'gift of the sun', 2, ['classic'], []],
  Milad:     ['boy', ['arabic', 'persian'], 'birth, birthday', 2, ['modern'], []],
  Mohsen:    ['boy', ['arabic', 'persian'], 'benevolent, charitable', 2, ['classic'], [], ['muslim', 'secular']],
  Morteza:   ['boy', ['arabic', 'persian'], 'chosen, approved', 3, ['classic'], [], ['muslim', 'secular']],
  Nima:      ['boy', ['persian'], 'just, fair', 2, ['modern'], []],
  Parsa:     ['boy', ['persian'], 'pious, devout', 2, ['modern'], []],
  Parviz:    ['boy', ['persian'], 'victorious, fortunate', 2, ['vintage'], []],
  Pedram:    ['boy', ['persian'], 'happy, prosperous', 2, ['modern'], []],
  Peyman:    ['boy', ['persian'], 'promise, covenant', 2, ['classic'], []],
  Pouya:     ['boy', ['persian'], 'seeker, one who strives', 2, ['modern'], []],
  Ramin:     ['boy', ['persian'], 'joyful; hero of the romance Vis and Ramin', 2, ['classic'], []],
  Rostam:    ['boy', ['persian'], 'tall, mighty; the greatest hero of the Shahnameh', 2, ['classic'], []],
  Saeed:     ['boy', ['arabic', 'persian'], 'happy, fortunate', 2, ['classic'], [], ['muslim', 'secular']],
  Saman:     ['boy', ['persian'], 'jasmine; prosperity', 2, ['modern'], []],
  Sasan:     ['boy', ['persian'], 'ancestor of the Sasanian kings', 2, ['vintage'], []],
  Shahab:    ['boy', ['persian', 'arabic'], 'shooting star', 2, ['classic'], []],
  Shahin:    ['boy', ['persian'], 'falcon', 2, ['classic', 'nature'], []],
  Shayan:    ['boy', ['persian'], 'worthy, deserving', 2, ['modern'], []],
  Sina:      ['boy', ['persian'], 'after Ibn Sina (Avicenna), the great physician and philosopher', 2, ['classic'], []],
  Sohrab:    ['boy', ['persian'], 'illustrious; tragic hero of the Shahnameh, son of Rostam', 2, ['classic'], []],
  Soroush:   ['boy', ['persian'], 'messenger angel; voice of inspiration', 2, ['unique'], []],
  Taha:      ['boy', ['arabic', 'persian'], 'the opening letters of a chapter of the Quran', 2, ['modern'], [], ['muslim', 'secular']],
  Vahid:     ['boy', ['arabic', 'persian'], 'unique, the one', 2, ['classic'], [], ['muslim', 'secular']],
  Zartosht:  ['boy', ['persian'], 'Persian form of Zoroaster, the ancient prophet', 2, ['unique'], []],
};

(function addPersianNames() {
  const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const byKey  = new Map(NAMES.map(n => [n.name.toLowerCase(), n]));
  const folded = new Set(NAMES.map(n => fold(n.name)));
  let added = 0, filled = 0;

  for (const [name, [gender, origin, meaning, syllables, style, nicknames, tradition]] of Object.entries(PERSIAN_NAMES)) {
    let entry = byKey.get(name.toLowerCase());
    if (!entry) {
      if (folded.has(fold(name))) continue;   // a spelling variant already in the app
      entry = { name, gender, origin: [], tradition: [], style: [], meaning: '', syllables: null };
      NAMES.push(entry);
      byKey.set(name.toLowerCase(), entry);
      added++;
    } else {
      // Only fill what's missing; a name the app already describes keeps its details
      const missing = !entry.meaning || !entry.origin.length;
      if (!missing) continue;
      if (entry.usOnly) entry.gender = gender;   // US-only entries had no details of their own
      filled++;
    }
    delete entry.usOnly;
    if (!entry.meaning) entry.meaning = meaning;
    if (!entry.origin.length) entry.origin = origin;
    if (!entry.style.length) entry.style = style;
    if (!entry.tradition.length) entry.tradition = tradition || ['secular'];
    if (!Number.isFinite(entry.syllables)) entry.syllables = syllables;
    if (!NICKNAMES[entry.name] && nicknames.length) NICKNAMES[entry.name] = nicknames;
  }
  PERSIAN_NAMES.added = added;
  PERSIAN_NAMES.filled = filled;
})();
