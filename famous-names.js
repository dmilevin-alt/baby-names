// First names made famous by athletes and celebrities. Tags each name with its famous
// namesakes (shown on cards, in name details and as a Browse filter) and the 'famous'
// style for the quiz. Names the app doesn't have yet are added; existing details are kept.
// Format: Name: [gender, [[person, known for, 'athlete' | 'celebrity'], ...], meaning]
const FAMOUS_NAMES = {
  // ── Basketball ──
  Kobe:      ['boy', [['Kobe Bryant', 'basketball', 'athlete']], 'named after Kobe beef from the Japanese city'],
  LeBron:    ['boy', [['LeBron James', 'basketball', 'athlete']], 'a modern American name'],
  Shaquille: ['boy', [["Shaquille O'Neal", 'basketball', 'athlete']], 'little one (Arabic)'],
  Kareem:    ['boy', [['Kareem Abdul-Jabbar', 'basketball', 'athlete']], 'generous, noble'],
  Stephen:   ['boy', [['Stephen Curry', 'basketball', 'athlete'], ['Stephen King', 'author', 'celebrity']], 'crown, garland'],
  Giannis:   ['boy', [['Giannis Antetokounmpo', 'basketball', 'athlete']], 'God is gracious (Greek form of John)'],
  Luka:      ['boy', [['Luka Dončić', 'basketball', 'athlete']], ''],
  Kevin:     ['boy', [['Kevin Durant', 'basketball', 'athlete'], ['Kevin Hart', 'comedian', 'celebrity']], ''],
  Dwyane:    ['boy', [['Dwyane Wade', 'basketball', 'athlete']], 'dark, swarthy (a form of Dwayne)'],
  Kawhi:     ['boy', [['Kawhi Leonard', 'basketball', 'athlete']], 'a modern American name'],
  Zion:      ['either', [['Zion Williamson', 'basketball', 'athlete']], ''],
  Caitlin:   ['girl', [['Caitlin Clark', 'basketball', 'athlete']], 'pure (Irish form of Katherine)'],
  Candace:   ['girl', [['Candace Parker', 'basketball', 'athlete']], ''],
  Sabrina:   ['girl', [['Sabrina Ionescu', 'basketball', 'athlete'], ['Sabrina Carpenter', 'singer', 'celebrity']], 'from the River Severn'],
  Diana:     ['girl', [['Diana Taurasi', 'basketball', 'athlete'], ['Princess Diana', 'royal', 'celebrity']], ''],
  Michael:   ['boy', [['Michael Jordan', 'basketball', 'athlete'], ['Michael Phelps', 'swimming', 'athlete'], ['Michael Jackson', 'singer', 'celebrity']], ''],
  Jordan:    ['either', [['Michael Jordan', 'basketball', 'athlete']], ''],

  // ── Tennis ──
  Serena:    ['girl', [['Serena Williams', 'tennis', 'athlete']], ''],
  Venus:     ['girl', [['Venus Williams', 'tennis', 'athlete']], 'Roman goddess of love'],
  Naomi:     ['girl', [['Naomi Osaka', 'tennis', 'athlete'], ['Naomi Campbell', 'model', 'celebrity']], ''],
  Coco:      ['girl', [['Coco Gauff', 'tennis', 'athlete'], ['Coco Chanel', 'fashion designer', 'celebrity']], 'a pet form of names like Nicole and Colette'],
  Roger:     ['boy', [['Roger Federer', 'tennis', 'athlete']], 'famous spearman'],
  Rafael:    ['boy', [['Rafael Nadal', 'tennis', 'athlete']], ''],
  Novak:     ['boy', [['Novak Djokovic', 'tennis', 'athlete']], 'new one (Serbian)'],
  Andre:     ['boy', [['Andre Agassi', 'tennis', 'athlete']], 'strong, manly'],
  Steffi:    ['girl', [['Steffi Graf', 'tennis', 'athlete']], 'crown (a form of Stephanie)'],
  Martina:   ['girl', [['Martina Navratilova', 'tennis', 'athlete']], 'dedicated to Mars'],
  Maria:     ['girl', [['Maria Sharapova', 'tennis', 'athlete'], ['Maria Callas', 'opera singer', 'celebrity']], ''],
  Billie:    ['girl', [['Billie Jean King', 'tennis', 'athlete'], ['Billie Eilish', 'singer', 'celebrity'], ['Billie Holiday', 'singer', 'celebrity']], ''],
  Arthur:    ['boy', [['Arthur Ashe', 'tennis', 'athlete']], ''],

  // ── Football (soccer) ──
  Lionel:    ['boy', [['Lionel Messi', 'soccer', 'athlete'], ['Lionel Richie', 'singer', 'celebrity']], 'young lion'],
  Cristiano: ['boy', [['Cristiano Ronaldo', 'soccer', 'athlete']], 'follower of Christ'],
  Ronaldo:   ['boy', [['Ronaldo Nazário', 'soccer', 'athlete']], 'ruler with counsel'],
  Diego:     ['boy', [['Diego Maradona', 'soccer', 'athlete']], ''],
  Zinedine:  ['boy', [['Zinedine Zidane', 'soccer', 'athlete']], 'beauty of the faith (Arabic)'],
  Kylian:    ['boy', [['Kylian Mbappé', 'soccer', 'athlete']], 'a modern French name, related to Kilian: little church'],
  Neymar:    ['boy', [['Neymar', 'soccer', 'athlete']], 'a Brazilian name'],
  Erling:    ['boy', [['Erling Haaland', 'soccer', 'athlete']], "nobleman's descendant (Norse)"],
  Zlatan:    ['boy', [['Zlatan Ibrahimović', 'soccer', 'athlete']], 'golden (Slavic)'],
  Mohamed:   ['boy', [['Mohamed Salah', 'soccer', 'athlete']], 'praiseworthy'],
  Thierry:   ['boy', [['Thierry Henry', 'soccer', 'athlete']], ''],
  Beckham:   ['boy', [['David Beckham', 'soccer', 'athlete']], ''],
  Megan:     ['girl', [['Megan Rapinoe', 'soccer', 'athlete'], ['Megan Thee Stallion', 'rapper', 'celebrity']], 'pearl (Welsh form of Margaret)'],
  Mia:       ['girl', [['Mia Hamm', 'soccer', 'athlete']], ''],
  Alex:      ['either', [['Alex Morgan', 'soccer', 'athlete']], ''],

  // ── American football & baseball ──
  Tom:       ['boy', [['Tom Brady', 'American football', 'athlete'], ['Tom Hanks', 'actor', 'celebrity'], ['Tom Cruise', 'actor', 'celebrity']], ''],
  Brady:     ['boy', [['Tom Brady', 'American football', 'athlete']], 'broad island (Irish surname)'],
  Peyton:    ['girl', [['Peyton Manning', 'American football', 'athlete']], ''],
  Patrick:   ['boy', [['Patrick Mahomes', 'American football', 'athlete']], ''],
  Travis:    ['boy', [['Travis Kelce', 'American football', 'athlete']], 'toll collector'],
  Jalen:     ['boy', [['Jalen Hurts', 'American football', 'athlete']], 'a modern American name'],
  Joe:       ['boy', [['Joe Montana', 'American football', 'athlete']], 'God will add'],
  Odell:     ['boy', [['Odell Beckham Jr.', 'American football', 'athlete']], 'wooded hill'],
  Drew:      ['either', [['Drew Brees', 'American football', 'athlete'], ['Drew Barrymore', 'actress', 'celebrity']], ''],
  Brett:     ['boy', [['Brett Favre', 'American football', 'athlete']], 'from Brittany'],
  Aaron:     ['boy', [['Aaron Judge', 'baseball', 'athlete'], ['Aaron Rodgers', 'American football', 'athlete']], ''],
  Derek:     ['boy', [['Derek Jeter', 'baseball', 'athlete']], 'ruler of the people'],
  Shohei:    ['boy', [['Shohei Ohtani', 'baseball', 'athlete']], 'soaring and peaceful (Japanese)'],
  Ichiro:    ['boy', [['Ichiro Suzuki', 'baseball', 'athlete']], 'first son (Japanese)'],
  Jackie:    ['either', [['Jackie Robinson', 'baseball', 'athlete'], ['Jackie Joyner-Kersee', 'track and field', 'athlete']], ''],

  // ── Olympics, track, gymnastics, swimming, winter ──
  Simone:    ['girl', [['Simone Biles', 'gymnastics', 'athlete'], ['Nina Simone', 'singer', 'celebrity']], ''],
  Nadia:     ['girl', [['Nadia Comăneci', 'gymnastics', 'athlete']], ''],
  Usain:     ['boy', [['Usain Bolt', 'sprinting', 'athlete']], 'a Jamaican name'],
  Jesse:     ['boy', [['Jesse Owens', 'track and field', 'athlete']], ''],
  Florence:  ['girl', [['Florence Griffith-Joyner', 'sprinting', 'athlete'], ['Florence Pugh', 'actress', 'celebrity']], ''],
  Allyson:   ['girl', [['Allyson Felix', 'sprinting', 'athlete']], 'noble'],
  Katie:     ['girl', [['Katie Ledecky', 'swimming', 'athlete']], ''],
  Missy:     ['girl', [['Missy Franklin', 'swimming', 'athlete'], ['Missy Elliott', 'rapper', 'celebrity']], 'a pet form of Melissa'],
  Lindsey:   ['girl', [['Lindsey Vonn', 'skiing', 'athlete']], 'island of linden trees'],
  Mikaela:   ['girl', [['Mikaela Shiffrin', 'skiing', 'athlete']], 'who is like God?'],
  Shaun:     ['boy', [['Shaun White', 'snowboarding', 'athlete']], 'God is gracious'],

  // ── Golf, hockey, motor sport, combat sports ──
  Tiger:     ['boy', [['Tiger Woods', 'golf (nickname)', 'athlete']], 'the big cat'],
  Arnold:    ['boy', [['Arnold Palmer', 'golf', 'athlete'], ['Arnold Schwarzenegger', 'actor', 'celebrity']], 'eagle power'],
  Rory:      ['either', [['Rory McIlroy', 'golf', 'athlete']], ''],
  Wayne:     ['boy', [['Wayne Gretzky', 'ice hockey', 'athlete']], 'wagon maker'],
  Sidney:    ['boy', [['Sidney Crosby', 'ice hockey', 'athlete']], 'wide island'],
  Lewis:     ['boy', [['Lewis Hamilton', 'Formula 1', 'athlete']], ''],
  Ayrton:    ['boy', [['Ayrton Senna', 'Formula 1', 'athlete']], 'a Brazilian name from an English surname'],
  Max:       ['boy', [['Max Verstappen', 'Formula 1', 'athlete']], ''],
  Valentino: ['boy', [['Valentino Rossi', 'motorcycle racing', 'athlete'], ['Valentino', 'fashion designer', 'celebrity']], 'strong, healthy'],
  Muhammad:  ['boy', [['Muhammad Ali', 'boxing', 'athlete']], 'praiseworthy'],
  Ali:       ['boy', [['Muhammad Ali', 'boxing', 'athlete']], ''],
  Floyd:     ['boy', [['Floyd Mayweather', 'boxing', 'athlete']], 'grey-haired'],
  Ronda:     ['girl', [['Ronda Rousey', 'mixed martial arts', 'athlete']], 'a form of Rhonda: good spear'],

  // ── Music ──
  Beyonce:   ['girl', [['Beyoncé', 'singer', 'celebrity']], "from her mother's maiden name, Beyincé"],
  Rihanna:   ['girl', [['Rihanna', 'singer', 'celebrity']], 'sweet basil (Arabic)'],
  Taylor:    ['either', [['Taylor Swift', 'singer', 'celebrity']], 'tailor'],
  Ariana:    ['girl', [['Ariana Grande', 'singer', 'celebrity']], ''],
  Selena:    ['girl', [['Selena Gomez', 'singer and actress', 'celebrity'], ['Selena Quintanilla', 'singer', 'celebrity']], 'moon'],
  Shakira:   ['girl', [['Shakira', 'singer', 'celebrity']], 'thankful (Arabic)'],
  Madonna:   ['girl', [['Madonna', 'singer', 'celebrity']], 'my lady (Italian)'],
  Cher:      ['girl', [['Cher', 'singer and actress', 'celebrity']], 'dear, beloved (French)'],
  Dolly:     ['girl', [['Dolly Parton', 'singer', 'celebrity']], 'a pet form of Dorothy: gift of God'],
  Whitney:   ['girl', [['Whitney Houston', 'singer', 'celebrity']], 'white island'],
  Aretha:    ['girl', [['Aretha Franklin', 'singer', 'celebrity']], 'virtue, excellence (Greek)'],
  Mariah:    ['girl', [['Mariah Carey', 'singer', 'celebrity']], 'a form of Maria'],
  Britney:   ['girl', [['Britney Spears', 'singer', 'celebrity']], 'from Brittany'],
  Miley:     ['girl', [['Miley Cyrus', 'singer', 'celebrity']], 'from her childhood nickname "Smiley"'],
  Demi:      ['girl', [['Demi Lovato', 'singer', 'celebrity'], ['Demi Moore', 'actress', 'celebrity']], 'a short form of Demetria'],
  Dua:       ['girl', [['Dua Lipa', 'singer', 'celebrity']], 'prayer (Albanian, from Arabic)'],
  Olivia:    ['girl', [['Olivia Rodrigo', 'singer', 'celebrity']], ''],
  Lana:      ['girl', [['Lana Del Rey', 'singer', 'celebrity']], ''],
  Adele:     ['girl', [['Adele', 'singer', 'celebrity']], ''],
  Ella:      ['girl', [['Ella Fitzgerald', 'jazz singer', 'celebrity']], ''],
  Nina:      ['girl', [['Nina Simone', 'singer', 'celebrity']], ''],
  Etta:      ['girl', [['Etta James', 'singer', 'celebrity']], 'ruler of the home (from Henrietta)'],
  Janis:     ['girl', [['Janis Joplin', 'singer', 'celebrity']], 'God is gracious'],
  Stevie:    ['either', [['Stevie Wonder', 'singer', 'celebrity'], ['Stevie Nicks', 'singer', 'celebrity']], 'crown'],
  Elton:     ['boy', [['Elton John', 'singer', 'celebrity']], 'old town'],
  Elvis:     ['boy', [['Elvis Presley', 'singer', 'celebrity']], 'all-wise'],
  Presley:   ['girl', [['Elvis Presley', 'singer', 'celebrity']], "priest's meadow"],
  Prince:    ['boy', [['Prince', 'singer', 'celebrity']], 'royal son'],
  Bruno:     ['boy', [['Bruno Mars', 'singer', 'celebrity']], 'brown'],
  Usher:     ['boy', [['Usher', 'singer', 'celebrity']], 'doorkeeper'],
  Drake:     ['boy', [['Drake', 'rapper', 'celebrity']], 'dragon'],
  Justin:    ['boy', [['Justin Bieber', 'singer', 'celebrity'], ['Justin Timberlake', 'singer', 'celebrity']], ''],
  Harry:     ['boy', [['Harry Styles', 'singer', 'celebrity'], ['Prince Harry', 'royal', 'celebrity']], ''],
  Shawn:     ['boy', [['Shawn Mendes', 'singer', 'celebrity']], 'God is gracious'],
  Freddie:   ['boy', [['Freddie Mercury', 'singer', 'celebrity']], ''],
  Bowie:     ['boy', [['David Bowie', 'singer', 'celebrity']], ''],
  Lennon:    ['boy', [['John Lennon', 'singer', 'celebrity']], ''],
  Hendrix:   ['boy', [['Jimi Hendrix', 'guitarist', 'celebrity']], ''],
  Jimi:      ['boy', [['Jimi Hendrix', 'guitarist', 'celebrity']], 'a form of Jimmy: supplanter'],
  Marley:    ['girl', [['Bob Marley', 'singer', 'celebrity']], 'pleasant wood'],
  Ringo:     ['boy', [['Ringo Starr', 'drummer', 'celebrity']], 'apple (Japanese); his stage name'],
  Mick:      ['boy', [['Mick Jagger', 'singer', 'celebrity']], 'a short form of Michael'],
  Kurt:      ['boy', [['Kurt Cobain', 'singer', 'celebrity']], 'bold counsel'],
  Frank:     ['boy', [['Frank Sinatra', 'singer', 'celebrity']], 'free one'],
  Dean:      ['boy', [['Dean Martin', 'singer', 'celebrity']], ''],
  Paul:      ['boy', [['Paul McCartney', 'singer', 'celebrity']], 'small, humble'],

  // ── Film & TV ──
  Zendaya:   ['girl', [['Zendaya', 'actress', 'celebrity']], 'to give thanks (from Shona)'],
  Scarlett:  ['girl', [['Scarlett Johansson', 'actress', 'celebrity']], ''],
  Audrey:    ['girl', [['Audrey Hepburn', 'actress', 'celebrity']], ''],
  Marilyn:   ['girl', [['Marilyn Monroe', 'actress', 'celebrity']], 'beloved (a blend of Mary and Lynn)'],
  Monroe:    ['girl', [['Marilyn Monroe', 'actress', 'celebrity']], 'mouth of the river Roe'],
  Grace:     ['girl', [['Grace Kelly', 'actress', 'celebrity']], ''],
  Meryl:     ['girl', [['Meryl Streep', 'actress', 'celebrity']], 'a form of Muriel: bright sea'],
  Julia:     ['girl', [['Julia Roberts', 'actress', 'celebrity']], ''],
  Reese:     ['girl', [['Reese Witherspoon', 'actress', 'celebrity']], ''],
  Halle:     ['girl', [['Halle Berry', 'actress', 'celebrity']], 'hall, manor'],
  Angelina:  ['girl', [['Angelina Jolie', 'actress', 'celebrity']], 'messenger of God'],
  Jennifer:  ['girl', [['Jennifer Aniston', 'actress', 'celebrity'], ['Jennifer Lopez', 'singer and actress', 'celebrity']], 'fair, white wave'],
  Oprah:     ['girl', [['Oprah Winfrey', 'TV host', 'celebrity']], 'from the biblical Orpah: fawn'],
  Emma:      ['girl', [['Emma Watson', 'actress', 'celebrity'], ['Emma Stone', 'actress', 'celebrity']], ''],
  Natalie:   ['girl', [['Natalie Portman', 'actress', 'celebrity']], ''],
  Margot:    ['girl', [['Margot Robbie', 'actress', 'celebrity']], ''],
  Nicole:    ['girl', [['Nicole Kidman', 'actress', 'celebrity']], ''],
  Cate:      ['girl', [['Cate Blanchett', 'actress', 'celebrity']], 'pure (from Catherine)'],
  Jodie:     ['girl', [['Jodie Foster', 'actress', 'celebrity']], 'praised (from Judith)'],
  Viola:     ['girl', [['Viola Davis', 'actress', 'celebrity']], 'violet'],
  Octavia:   ['girl', [['Octavia Spencer', 'actress', 'celebrity']], ''],
  Lupita:    ['girl', [["Lupita Nyong'o", 'actress', 'celebrity']], 'a pet form of Guadalupe'],
  Saoirse:   ['girl', [['Saoirse Ronan', 'actress', 'celebrity']], ''],
  Salma:     ['girl', [['Salma Hayek', 'actress', 'celebrity']], ''],
  Gal:       ['girl', [['Gal Gadot', 'actress', 'celebrity']], ''],
  Penelope:  ['girl', [['Penélope Cruz', 'actress', 'celebrity']], ''],
  Sophia:    ['girl', [['Sophia Loren', 'actress', 'celebrity']], ''],
  Judy:      ['girl', [['Judy Garland', 'actress and singer', 'celebrity']], 'praised (from Judith)'],
  Shirley:   ['girl', [['Shirley Temple', 'actress', 'celebrity']], 'bright meadow'],
  Rita:      ['girl', [['Rita Hayworth', 'actress', 'celebrity'], ['Rita Ora', 'singer', 'celebrity']], 'pearl (from Margarita)'],
  Kylie:     ['girl', [['Kylie Minogue', 'singer', 'celebrity'], ['Kylie Jenner', 'TV personality', 'celebrity']], ''],
  Kendall:   ['girl', [['Kendall Jenner', 'model', 'celebrity']], 'valley of the River Kent'],
  Gigi:      ['girl', [['Gigi Hadid', 'model', 'celebrity']], 'a pet form of Georgina'],
  Bella:     ['girl', [['Bella Hadid', 'model', 'celebrity']], ''],
  Heidi:     ['girl', [['Heidi Klum', 'model', 'celebrity']], 'noble (from Adelheid)'],
  Tyra:      ['girl', [['Tyra Banks', 'model and TV host', 'celebrity']], 'a modern name; also Scandinavian, of Tyr'],
  Keanu:     ['boy', [['Keanu Reeves', 'actor', 'celebrity']], ''],
  Leonardo:  ['boy', [['Leonardo DiCaprio', 'actor', 'celebrity'], ['Leonardo da Vinci', 'artist', 'celebrity']], ''],
  Brad:      ['boy', [['Brad Pitt', 'actor', 'celebrity']], 'broad meadow'],
  Denzel:    ['boy', [['Denzel Washington', 'actor', 'celebrity']], 'from a Cornish place name'],
  Morgan:    ['either', [['Morgan Freeman', 'actor', 'celebrity']], ''],
  Will:      ['boy', [['Will Smith', 'actor', 'celebrity']], 'resolute protector (from William)'],
  Keira:     ['girl', [['Keira Knightley', 'actress', 'celebrity']], 'little dark one'],
  Ryan:      ['boy', [['Ryan Reynolds', 'actor', 'celebrity'], ['Ryan Gosling', 'actor', 'celebrity']], 'little king'],
  Hugh:      ['boy', [['Hugh Jackman', 'actor', 'celebrity']], ''],
  Idris:     ['boy', [['Idris Elba', 'actor', 'celebrity']], ''],
  Dwayne:    ['boy', [['Dwayne "The Rock" Johnson', 'actor', 'celebrity']], 'dark, swarthy'],
  Sylvester: ['boy', [['Sylvester Stallone', 'actor', 'celebrity']], 'of the woods'],
  Clint:     ['boy', [['Clint Eastwood', 'actor', 'celebrity']], 'hill town (from Clinton)'],
  Marlon:    ['boy', [['Marlon Brando', 'actor', 'celebrity']], 'a modern name; possibly little falcon'],
  Cary:      ['boy', [['Cary Grant', 'actor', 'celebrity']], 'from a Celtic river name'],
  Fred:      ['boy', [['Fred Astaire', 'dancer and actor', 'celebrity']], 'peaceful ruler'],
  Gene:      ['boy', [['Gene Kelly', 'dancer and actor', 'celebrity']], 'well-born'],
  Chadwick:  ['boy', [['Chadwick Boseman', 'actor', 'celebrity']], "Chad's dwelling"],
  Pedro:     ['boy', [['Pedro Pascal', 'actor', 'celebrity']], 'rock'],
  Rami:      ['boy', [['Rami Malek', 'actor', 'celebrity']], 'archer (Arabic)'],
  Mahershala: ['boy', [['Mahershala Ali', 'actor', 'celebrity']], 'from Maher-shalal-hash-baz in the Bible'],
  Timothee:  ['boy', [['Timothée Chalamet', 'actor', 'celebrity']], 'honoring God (French form of Timothy)'],
  Zac:       ['boy', [['Zac Efron', 'actor', 'celebrity']], 'God remembers'],
  Jamie:     ['either', [['Jamie Foxx', 'actor', 'celebrity'], ['Jamie Lee Curtis', 'actress', 'celebrity']], ''],
  Paris:     ['girl', [['Paris Hilton', 'TV personality', 'celebrity']], ''],
};

(function addFamousNames() {
  const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const byKey = new Map(NAMES.map(n => [fold(n.name), n]));
  let added = 0, tagged = 0;

  for (const [name, [gender, people, meaning]] of Object.entries(FAMOUS_NAMES)) {
    let entry = byKey.get(fold(name)) || byKey.get(fold(MERGED_SPELLINGS?.[name] || ''));
    if (!entry) {
      entry = { name, gender, origin: [], tradition: [], style: [], meaning: '', syllables: null };
      NAMES.push(entry);
      byKey.set(fold(name), entry);
      added++;
    } else {
      // Use the famous capitalization (Lebron → LeBron); votes on the old one still count
      if (entry.name !== name && entry.name.toLowerCase() === name.toLowerCase()) {
        MERGED_SPELLINGS[entry.name] = name;
        entry.name = name;
      }
      tagged++;
    }
    if (!entry.meaning && meaning) entry.meaning = meaning;
    entry.famous = people.map(([who, knownFor, type]) => ({ who, knownFor, type }));
    entry.style = [...new Set([...(entry.style || []), 'famous'])];
  }
  Object.assign(FAMOUS_NAMES, { added, tagged });
})();

// 'athlete', 'celebrity' or both, for the Browse filter
function famousTypes(n) {
  return new Set((n?.famous || []).map(f => f.type));
}
