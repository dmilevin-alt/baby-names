// Official 2025 newborn-name rankings. Lists include all names tied at rank 100.
const OFFICIAL_NAME_RANKINGS = [
  {
    jurisdiction: 'Canada',
    year: 2025,
    source: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710014701',
    girls: 'Charlotte|Olivia|Emma|Sophia|Amelia|Sofia|Chloe|Mia|Lily|Nora|Alice|Violet|Mila|Isla|Evelyn|Ellie|Eliana|Sophie|Ava|Clara|Maya|Ella|Hazel|Aria|Elizabeth|Zoe|Isabella|Eleanor|Aurora|Florence|Rose|Lucy|Charlie|Eva|Hannah|Eloise|Emily|Ayla|Emilia|Elena|Julia|Abigail|Ivy|Harper|Avery|Grace|Georgia|Juliette|Victoria|Maeve|Luna|Layla|Lainey|Claire|Beatrice|Scarlett|Penelope|Sarah|Margot|Zoey|Anna|Maria|Livia|Romy|Sadie|Stella|Lea|Audrey|Madison|Rosalie|Willow|Naomi|Isabelle|Leah|Hailey|Athena|Jade|Iris|Rehmat|Millie|Anaya|Summer|Amara|Asees|Jasmine|Maryam|Nova|Ruby|Adeline|Freya|Jind|Daisy|Quinn|Josephine|Lena|Kaia|Riley|Sienna|Everly|Celine',
    boys: 'Noah|Theodore|Liam|Leo|William|Oliver|Jack|Benjamin|Thomas|Lucas|Henry|James|Adam|Arthur|Theo|Levi|Nathan|Ethan|Jacob|Muhammad|Luca|Gabriel|Hudson|Logan|Felix|Owen|Charles|Louis|Elijah|Samuel|Jackson|Daniel|Bennett|Miles|Nolan|Elias|Caleb|Wesley|Isaac|Mason|Rowan|Alexander|Maverick|David|Luke|Mateo|Jayden|Matteo|Wyatt|Raphael|Myles|Charlie|Cooper|Ezra|Michael|Edouard|Elliot|Asher|Austin|Kai|Leon|Ryan|John|Beau|Joseph|Carter|Ali|Sebastian|Grayson|Matthew|Weston|Emile|Aiden|Zayn|Eli|Lincoln|Zorawar|Roman|Luka|Brooks|Everett|Callum|Atlas|Victor|Enzo|Jules|Ibrahim|Arjan|Jasper|Max|Joshua|Anthony|Henri|Zachary|Isaiah|Evan|Milo|Arnaud|George|Julian'
  },
  {
    jurisdiction: 'England and Wales',
    year: 2025,
    source: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths/datasets/babynamesenglandandwalesbabynamesstatistics',
    girls: 'Olivia|Lily|Amelia|Isla|Florence|Freya|Poppy|Elsie|Ivy|Isabella|Ava|Evelyn|Sophia|Phoebe|Sienna|Mabel|Sofia|Daisy|Matilda|Willow|Mia|Arabella|Harper|Rosie|Charlotte|Maeve|Grace|Maya|Hallie|Margot|Lottie|Delilah|Penelope|Aria|Evie|Millie|Violet|Ruby|Aurora|Ada|Mila|Ayla|Maisie|Emily|Esme|Ella|Olive|Bonnie|Elodie|Layla|Emilia|Alice|Maryam|Isabelle|Ottilie|Eleanor|Iris|Eva|Harriet|Luna|Lyla|Eliana|Sophie|Orla|Eliza|Thea|Rose|Nova|Imogen|Lyra|Hazel|Erin|Zara|Elizabeth|Nora|Robyn|Clara|Nancy|Fatima|Eden|Ophelia|Raya|Eloise|Gracie|Emma|Anaya|Lola|Maria|Chloe|Athena|Bella|Darcie|Scarlett|Myla|Alba|Rosa|Marnie|Lara|Lilah|Frankie',
    boys: 'Muhammad|Noah|Leo|Luca|Arthur|Oliver|George|Oscar|Theodore|Freddie|Archie|Theo|Henry|Jude|Arlo|Alfie|Rory|Finley|Harry|Mohammed|Albie|Charlie|Elijah|Jack|William|Adam|Roman|Louie|Reuben|Rowan|Edward|Lucas|Oakley|Teddy|Thomas|Isaac|Reggie|Ezra|Ronnie|Alexander|Jacob|James|Hudson|Tommy|Sonny|Hugo|Sebastian|Max|Louis|Harrison|Jesse|Frederick|Joshua|Ethan|Mohammad|Frankie|Albert|Vinnie|Felix|Joseph|Benjamin|Daniel|Jasper|Musa|Yusuf|Samuel|Myles|Liam|Elias|Ibrahim|Otis|Dylan|David|Finn|Zachary|Alfred|Mason|Kai|Rupert|Gabriel|Yahya|Caleb|Riley|Enzo|Michael|Austin|Logan|Jaxon|Toby|Milo|Hunter|Ellis|Vincent|Bobby|Elliot|Ralph|Carter|Stanley|Nathan|Ruben'
  },
  {
    jurisdiction: 'Scotland',
    year: 2025,
    source: 'https://www.nrscotland.gov.uk/publications/babies-first-names-2025/',
    girls: 'Freya|Isla|Olivia|Amelia|Grace|Emily|Millie|Lily|Sophia|Rosie|Maisie|Sophie|Ava|Ella|Charlotte|Ivy|Sofia|Evie|Hallie|Maya|Elsie|Orla|Harper|Maeve|Aria|Daisy|Willow|Eilidh|Lottie|Ruby|Isabella|Bonnie|Gracie|Mia|Poppy|Sienna|Lucy|Esme|Georgia|Mila|Ayla|Arabella|Layla|Robyn|Aurora|Remi|Phoebe|Ellie|Jessica|Lyla|Ada|Alice|Zoe|Florence|Anna|Zara|Molly|Mabel|Sadie|Skye|Callie|Emilia|Alba|Violet|Hannah|Nina|Maeva|Summer|Thea|Fiadh|Penelope|Eva|Rose|Nova|Myla|Niamh|Cora|Holly|Margot|Quinn|Romy|Clara|Lilly|Chloe|Eden|Evelyn|Rosa|Nora|Imogen|Iona|Eloise|Heidi|Matilda|Emma|Mollie|Flora|Annie|Hazel|Mirren|Darcy|Billie|Lilah|Lucia',
    boys: 'Noah|Luca|Rory|Muhammad|Oliver|Theo|Leo|Archie|Finlay|Harris|Jude|Freddie|Jack|James|Brodie|Charlie|Alfie|Finn|Arthur|Oscar|Thomas|Alexander|Lewis|Arlo|Max|Sonny|Harrison|Tommy|Lucas|Albie|Harry|Adam|Roman|Angus|Logan|Callan|Louie|Reuben|Theodore|Kai|Mason|Blake|Daniel|Myles|Jacob|Hudson|Rowan|Cameron|Caleb|George|Liam|Ruaridh|William|Hunter|Ethan|Ollie|Isaac|Nathan|Elijah|Ronan|Arran|Hamish|Blair|Cole|Joseph|Samuel|Michael|Callum|Grayson|Luke|Cody|Lochlan|Nico|Ruairidh|Joey|Reggie|Joshua|Jamie|Cooper|Lachlan|Carter|Matthew|Louis|Riley|Elliot|Oakley|Robert|Teddy|Henry|Murray|Fergus|David|Austin|Jax|Vinnie|Aaron|Leon|Frankie|Robbie|Cillian|Ellis'
  },
  {
    jurisdiction: 'Australia — New South Wales',
    year: 2025,
    source: 'https://data.nsw.gov.au/data/dataset/a677cbe2-91e1-4e45-b771-08830d3d9e41/resource/2adcb228-9101-4c95-a786-b3216539b4a2/download/popular_baby_names_1952_to_2025.csv',
    girls: 'Charlotte|Amelia|Olivia|Isla|Mia|Sophia|Chloe|Hazel|Lily|Sienna|Grace|Ella|Sofia|Evelyn|Harper|Matilda|Isabella|Ava|Zoe|Violet|Mila|Sophie|Willow|Elsie|Florence|Daisy|Evie|Ruby|Aria|Ivy|Eleanor|Lucy|Ellie|Audrey|Layla|Eloise|Billie|Maeve|Eliana|Millie|Penelope|Aurora|Hallie|Ayla|Poppy|Scarlett|Zara|Emilia|Remi|Sadie|Freya|Nora|Maya|Delilah|Abigail|Luna|Lainey|Isabelle|Georgia|Stella|Eden|Emily|Elodie|Elena|Phoebe|Maryam|Emma|Olive|Bonnie|Rose|Kaia|Lola|Hannah|Frankie|Pippa|Alice|Amara|Lucia|Amira|Mackenzie|Eva|Adeline|Elizabeth|Rosie|Margot|Aaliyah|Gabriella|Maisie|Summer|Leah|Riley|Kiara|Harriet|Maggie|Mabel|Lottie|Anastasia|Jasmine|Valentina|Piper',
    boys: 'Noah|Oliver|Theodore|Luca|Leo|Henry|Elijah|Levi|Hudson|Jack|William|Charlie|Thomas|Lucas|Liam|James|Oscar|Hugo|Cooper|Arthur|Muhammad|Alexander|Kai|George|Beau|Isaac|Archie|Harvey|Harrison|Max|Sebastian|Theo|Joseph|Lachlan|Elias|Archer|Austin|Samuel|Harry|Sonny|Gabriel|Jacob|Xavier|Billy|Louie|Benjamin|Spencer|Arlo|Ethan|Roman|Koa|Finn|Leon|Jude|Louis|Mason|Jasper|Ezra|Ali|Hunter|Felix|Michael|Bodhi|Daniel|Mateo|Riley|Fletcher|Miles|Matteo|Remy|Carter|Isaiah|Adam|Myles|Edward|Angus|Luka|Frederick|Leonardo|Darcy|Ryan|Lennox|Patrick|Ibrahim|River|Reuben|Rory|Asher|Eli|Vincent|Jordan|Jackson|Flynn|Charles|August|Alfie|Tommy|Micah|Maverick|Grayson'
  },
  {
    jurisdiction: 'Australia — Queensland',
    year: 2025,
    source: 'https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id=48619191-15bf-4028-9dbe-f12175810f2b&limit=500',
    girls: 'Charlotte|Amelia|Isla|Olivia|Hazel|Matilda|Mia|Violet|Lily|Harper|Grace|Sophia|Willow|Ivy|Lucy|Elsie|Evelyn|Isabella|Sienna|Daisy|Sophie|Lainey|Aurora|Ellie|Freya|Sadie|Aria|Ruby|Millie|Ella|Florence|Eleanor|Eloise|Poppy|Layla|Penelope|Audrey|Remi|Mila|Ava|Delilah|Evie|Chloe|Sofia|Frankie|Olive|Ayla|Luna|Isabelle|Maeve|Billie|Summer|Hallie|Emilia|Nora|Maisie|Maya|Abigail|Zoe|Mackenzie|Georgia|Alice|Eliana|Zara|Phoebe|Lola|Emily|Bonnie|Scarlett|Stella|Adeline|Elodie|Margot|Lyla|Pippa|Rosie|Eden|Hannah|Heidi|Addison|Harriet|Claire|Athena|Lilah|Emma|Riley|Piper|Rose|Quinn|Lilly|Aubrey|Maggie|Kaia|Gracie|Aaliyah|Lottie|Sage|Paisley|Savannah|Charlie',
    boys: 'Oliver|Noah|Theodore|Henry|William|Hudson|Luca|Leo|Charlie|Elijah|Arthur|Archie|Levi|Thomas|Jack|Harrison|James|Archer|George|Cooper|Arlo|Harvey|Beau|Hugo|Kai|Lucas|Theo|Oscar|Max|Alexander|Austin|Liam|Koa|Patrick|Harry|Sebastian|Sonny|Billy|Benjamin|Hunter|Samuel|Carter|Atlas|Lachlan|Jasper|Fletcher|Louie|Grayson|Edward|Myles|Ezra|Mason|Riley|Spencer|Xavier|Joseph|Maverick|Miles|Vincent|Elias|Louis|River|Angus|Eli|Bodhi|Malakai|Lincoln|Luka|Reuben|Finn|Jackson|Leon|Asher|August|Parker|Charles|Lennox|Ethan|Finley|Wyatt|Owen|Colton|Oakley|Felix|Ezekiel|Rory|Darcy|Tommy|Isaiah|Micah|Jude|Alfie|Bowie|Walter|Alfred|Flynn|Roman|Isaac|Michael|Jett|Elliot'
  },
  {
    jurisdiction: 'Australia — South Australia',
    year: 2025,
    source: 'https://data.sa.gov.au/data/dataset/9849aa7f-e316-426e-8ab5-74658a62c7e6',
    girls: 'Charlotte|Isla|Olivia|Amelia|Harper|Hazel|Violet|Elsie|Lily|Ruby|Daisy|Grace|Mia|Ivy|Lucy|Willow|Ella|Sophia|Sienna|Ava|Matilda|Aurora|Evelyn|Isabella|Mila|Maeve|Millie|Sophie|Sadie|Florence|Poppy|Sofia|Chloe|Ellie|Aria|Evie|Eleanor|Eloise|Scarlett|Billie|Layla|Maisie|Alice|Zara|Audrey|Maya|Nora|Adeline|Ayla|Lottie|Margot|Freya|Hallie|Delilah|Imogen|Maggie|Gracie|Isabelle|Hannah|Summer|Emma|Eva|Harriet|Remi|Rosie|Zoe|Lola|Luna|Olive|Stella|Bonnie|Penelope|Eliana|Emilia|Lilah|Mackenzie|Amara|Elodie|Emily|Lyla|Eden|Georgia|Riley|Frankie|Harlow|Mabel|Abigail|Elena|Liliana|Lilly|Piper|Indie|Lainey|Sarah|Savannah|Ada|Addison|Gia|Isabel|Jasmine',
    boys: 'Oliver|Noah|Henry|Leo|Theodore|Luca|Charlie|Levi|Elijah|Jack|Hugo|Oscar|Hudson|William|George|Harrison|Lucas|Archer|Archie|Harvey|Arthur|Sebastian|Darcy|Austin|Harry|James|Arlo|Isaac|Alexander|Liam|Beau|Kai|Edward|Muhammad|Logan|Parker|Louie|Louis|Max|Rory|Riley|Carter|Jasper|Mason|Billy|Samuel|Sonny|Theo|Thomas|Benjamin|Elliot|Jude|Lenny|Luka|Michael|Miles|Cooper|Patrick|Lachlan|Bodhi|Ezra|Fletcher|Jordan|Joshua|Finn|Lincoln|Myles|Bowie|Elias|Grayson|Isaiah|Joseph|Matteo|Spencer|Angus|Caleb|Hunter|Ryder|Asher|Vincent|Alfred|Ethan|Finley|Felix|Hamish|Koa|Ollie|Xavier|Alfie|Daniel|Jackson|Malakai|Oakley|Otis|Flynn|Jacob|Micah|Bobby|Freddie|Ali'
  },
  {
    jurisdiction: 'Australia — Victoria',
    year: 2025,
    source: 'https://www.bdm.vic.gov.au/sites/default/files/2026-01/Top-100-Baby-Names-2025.xlsx',
    girls: 'Charlotte|Amelia|Hazel|Mia|Isla|Olivia|Lily|Sienna|Matilda|Ava|Evelyn|Lucy|Grace|Harper|Violet|Ella|Zoe|Ivy|Ruby|Isabella|Mila|Sophia|Sophie|Billie|Daisy|Sofia|Audrey|Chloe|Elsie|Evie|Florence|Poppy|Sadie|Aria|Maeve|Eloise|Ayla|Maya|Isabelle|Zara|Aurora|Layla|Millie|Penelope|Willow|Nora|Ellie|Eleanor|Remi|Freya|Hannah|Summer|Harriet|Scarlett|Georgia|Eden|Luna|Emma|Frankie|Stella|Alice|Emily|Bonnie|Lola|Emilia|Margot|Eva|Rosie|Lainey|Eliana|Elena|Mackenzie|Clara|Maisie|Phoebe|Delilah|Maggie|Nina|Elodie|Aaliyah|Lyla|Maryam|Abigail|Amira|Adeline|Jasmine|Lottie|Imogen|Pippa|Amber|Ariana|Cleo|Mabel|Piper|Rose|Addison|Kaia|Riley|Amara|Lucia|Sarah',
    boys: 'Noah|Oliver|Henry|Leo|Theodore|Charlie|Luca|Jack|Levi|William|Oscar|Thomas|Elijah|Archie|Harvey|Lucas|Hudson|Muhammad|Isaac|Max|George|Arthur|Harry|Liam|Harrison|Patrick|Archer|Alexander|Sebastian|James|Hugo|Kai|Xavier|Beau|Ethan|Miles|Billy|Austin|Cooper|Arlo|Jasper|Mason|Sonny|Lachlan|Louis|Felix|Ali|Spencer|Samuel|Edward|Jude|Theo|Darcy|Jordan|Benjamin|Finn|Leon|Angus|River|Hunter|Tommy|Riley|Adam|Luka|Ryan|Joseph|Lenny|Roman|Ezra|Parker|Logan|Louie|Myles|Gabriel|Finley|Jacob|Rory|Daniel|Joshua|Fletcher|Lincoln|Ollie|Bobby|Bodhi|Eli|Frederick|Flynn|Zayn|Elias|Charles|Jayden|Asher|Ibrahim|Isaiah|August|Oakley|Marcus|Aiden|Elliot|Carter|Remy'
  },
  {
    jurisdiction: 'France',
    year: 2025,
    source: 'https://www.insee.fr/fr/statistiques/8595130',
    girls: 'Louise|Jade|Ambre|Alma|Alba|Rose|Emma|Romy|Adèle|Alice|Iris|Lou|Agathe|Inaya|Anna|Nour|Lina|Charlie|Olivia|Julia|Mia|Victoire|Jeanne|Giulia|Léonie|Eva|Esmée|Juliette|Sofia|Zoé|Léna|Alya|Luna|Chloé|Nina|Victoria|Alix|Léa|Romane|Ava|Charlotte|Elena|Lucie|Albane|Lyana|Margot|Gabrielle|Emy|Aya|Livia|Théa|Yasmine|Lola|Mila|Céleste|Lyna|Margaux|Apolline|Aria|Maria|Arya|Suzanne|Capucine|Sarah|Ella|Jannah|Inès|Mya|Diane|Lily|Ayla|Constance|Louna|Lya|Camille|Maya|Valentina|Clémence|Maryam|Judith|Amélia|Valentine|Ellie|Nora|Thaïs|Mariam|Rym|Joséphine|Sophia|Lila|Héloïse|Éléonore|Fatoumata|Joy|Lise|Zélie|Lana|Aïcha|Jennah|Andréa',
    boys: 'Gabriel|Noah|Léo|Raphaël|Louis|Jules|Arthur|Léon|Adam|Maël|Isaac|Sacha|Marceau|Liam|Eden|Noé|Elio|Gabin|Lucas|Aaron|Mohamed|Malo|Paul|Ayden|Hugo|Ibrahim|Marius|Victor|Eliott|Ethan|Imran|Aylan|Naël|Martin|Ezio|Côme|Gaspard|Zayn|Nathan|Léandre|Basile|Théo|Augustin|Nino|Milo|Mathis|Lyam|Oscar|Ismaël|Simon|Charlie|Charles|Andrea|Tom|Kaïs|Amir|Robin|Rayan|Valentin|Charly|Camille|Antoine|Auguste|Alessio|Sohan|Kayden|Naïm|Pablo|Mahé|Samuel|Axel|Owen|Ali|Issa|Timéo|Achille|Joseph|Nolan|Tiago|Lucien|Soan|Roméo|Yanis|Elyo|Noa|Andréa|Alexandre|Marin|Mathéo|Anas|Enzo|Maxence|Livio|Maé|Noam|Imrân|Evan|Abel|Milan|Marcel'
  },
  {
    jurisdiction: 'Ireland',
    year: 2025,
    source: 'https://www.cso.ie/en/releasesandpublications/ep/p-ibn/irishbabiesnames2025/data/',
    girls: 'Lily|Éabha|Fiadh|Grace|Sadie|Emily|Sophie|Olivia|Croía|Éala|Mia|Amelia|Isla|Sophia|Ellie|Lucy|Ella|Saoirse|Robyn|Molly|Hannah|Chloe|Rosie|Sofia|Freya|Anna|Ava|Emma|Evie|Róisín|Caoimhe|Sadhbh|Annie|Aoife|Isabelle|Millie|Ruby|Méabh|Ayla|Maya|Alice|Katie|Charlotte|Daisy|Ada|Zoe|Clodagh|Isabella|Maisie|Ailbhe|Ivy|Cara|Kate|Harper|Elsie|Hazel|Leah|Willow|Rose|Layla|Maeve|Aoibhín|Sienna|Bonnie|Fíadh|Emilia|Sarah|Zara|Eva|Holly|Erin|Aria|Clara|Maria|Eve|Aurora|Elizabeth|Nora|Hailey|Caragh|Faye|Mila|Ríadh|Luna|Rhea|Cora|Mollie|Gracie|Cadhla|Niamh|Georgia|Heidi|Áine|Evelyn|Mabel|Arabella|Lottie|Phoebe|Hallie|Nancy|Raya',
    boys: 'Rían|Jack|Noah|James|Oisín|Fionn|Liam|Tadhg|Cillian|Leo|Luca|Páidí|Charlie|Daniel|Finn|Conor|Thomas|Oliver|Darragh|Adam|Theo|Michael|Luke|Seán|Harry|Patrick|Tommy|Sonny|John|Bobby|Ollie|Oscar|Cian|Kai|Muhammad|Alfie|Alex|Senan|Billy|Ben|Max|Hugo|Caelan|Theodore|David|Archie|Jamie|Tom|Callum|Sam|Ethan|Freddie|Shay|Arlo|Alexander|Matthew|Arthur|Ryan|Daithí|Rory|Jude|Jacob|Frankie|Donnacha|Joseph|Lucas|Dáithí|Ruairí|Dylan|Teddy|Aaron|Nathan|Leon|William|Mason|Danny|Henry|Rowan|Samuel|Evan|Joshua|Aidan|Benjamin|Levi|Iarlaith|Ronan|Éanna|Dáire|Naoise|Cathal|Cody|Joey|Odhrán|Zach|Jake|Tomás|Conall|Elijah|Mark|Paddy|Teidí'
  },
  {
    jurisdiction: 'Northern Ireland',
    year: 2025,
    source: 'https://www.nisra.gov.uk/publications/baby-names-2025',
    girls: 'Grace|Fiadh|Olivia|Isla|Lily|Emily|Annie|Aoife|Meabh|Freya|Anna|Sadie|Eabha|Rosie|Charlotte|Sophia|Sophie|Amelia|Croia|Ava|Ellie|Erin|Elsie|Ruby|Cara|Ella|Phoebe|Lottie|Mia|Evie|Isabella|Molly|Sofia|Lucy|Clodagh|Maisie|Rhea|Mollie|Clara|Harper|Ivy|Hannah|Nora|Daisy|Saoirse|Sienna|Ada|Cora|Aria|Gracie|Poppy|Eden|Katie|Margot|Maeve|Zara|Georgia|Hallie|Heidi|Rose|Robyn|Eva|Mabel|Rosa|Alice|Bonnie|Esme|Chloe|Layla|Willow|Cassie|Eala|Lucia|Lyla|Caoimhe|Nina|Cadhla|Connie|Emma|Niamh|Saorlaith|Ayla|Raya|Florence|Martha|Maya|Arabella|Aurora|Eireann|Holly|Lainey|Callie|Eimear|Emilia|Maria|Abigail|Ailbhe|Darcie|Eliza|Evelyn|Jessica|Millie|Nancy|Roise|Thea',
    boys: 'Noah|Jack|James|Charlie|Leo|Oisin|Theo|Luca|Arthur|Jude|Cillian|Oliver|Harry|Tommy|Archie|Finn|Ronan|Thomas|Rian|Rory|Freddie|Shea|Alfie|Henry|Oscar|Patrick|Jacob|Daithi|Reuben|Rowan|Isaac|Darragh|Ethan|Daniel|George|Caleb|Daire|Michael|Ruairi|Ollie|Theodore|Ezra|Lucas|Conor|Fionn|Kai|Liam|Alexander|Arlo|Hugo|Lorcan|Levi|Sonny|Joseph|Albie|Joshua|Mason|Odhran|Elijah|William|Benjamin|Conan|Matthew|Hudson|Jonah|Max|John|Sean|Logan|Reggie|Samuel|Aodhan|Cian|Joey|Paidi|Senan|Cody|Riley|Adam|Frankie|Harrison|Tom|Louie|Luke|Tadhg|Eoin|Micah|Micheal|Myles|Conn|Cuan|Eli|Hunter|Padraig|Aidan|Cahir|Naoise|Ruadhan|Caolan|Jesse|Ryan|Tiernan'
  },
  {
    jurisdiction: 'New Zealand',
    year: 2025,
    source: 'https://smartstart.services.govt.nz/news/baby-names',
    girls: 'Isla|Charlotte|Amelia|Hazel|Olivia|Lily|Lucy|Mila|Aria|Mia|Sophia|Sophie|Ella|Ruby|Isabella|Millie|Harper|Freya|Sadie|Ava|Grace|Matilda|Evelyn|Chloe|Florence|Emily|Willow|Violet|Ivy|Maeve|Olive|Layla|Maia|Billie|Aurora|Daisy|Ayla|Eden|Frankie|Margot|Sienna|Elsie|Penelope|Sofia|Kaia|Ellie|Phoebe|Alice|Zoe|Luna|Riley|Eliana|Poppy|Eleanor|Kiara|Harriet|Amaia|Isabelle|Evie|Maisie|Elizabeth|Emma|Eva|Georgia|Zara|Mabel|Hannah|Mackenzie|Nora|Aaliyah|Scarlett|Delilah|Eloise|Ada|Indie|Madison|Maya|Arabella|Iris|Leah|Molly|Emilia|Rosie|Lottie|Stella|Thea|Quinn|Abigail|Anna|Bella|Esther|Rose|Athena|Jasmine|Manaia|Esme|Lola|Lucia|Malia|Addison',
    boys: 'Noah|Luca|Oliver|George|Theodore|Leo|Charlie|Jack|Elijah|Theo|Arthur|Hudson|James|Henry|Cooper|William|Lachlan|Lucas|Archie|Liam|Oscar|Hugo|Levi|Beau|Ezra|Hunter|Thomas|Benjamin|Archer|Louie|Felix|Ethan|Carter|Louis|Max|Asher|Finn|Arlo|Mason|Ezekiel|Alexander|Austin|Luka|Harry|Isaac|Luke|Eli|Joshua|Elias|Zion|Harvey|Koa|Miles|Samuel|Harrison|Ryan|Bodhi|Isaiah|Jackson|Roman|Oakley|Caleb|Jasper|Joseph|Daniel|Riley|Micah|Atlas|Leon|Michael|Angus|Tobias|Kiwa|Toby|Tommy|Zorawar|Edward|Charles|Sebastian|Beauden|Nico|River|Aiden|Billy|Jacob|Myles|Spencer|Adam|John|Rowan|Grayson|Nathan|David|Freddie|Jett|Keanu|Mateo|Ryder|Alfred|Arjan'
  }
];

const namesByKey = new Map(NAMES.map(name => [name.name.toLowerCase(), name]));

for (const ranking of OFFICIAL_NAME_RANKINGS) {
  for (const gender of ['girls', 'boys']) {
    for (const [index, sourceName] of ranking[gender].split('|').entries()) {
      const name = sourceName.normalize('NFC');
      const key = name.toLowerCase();
      let entry = namesByKey.get(key);

      if (!entry) {
        entry = {
          name,
          gender: gender === 'girls' ? 'girl' : 'boy',
          origin: [],
          tradition: [],
          style: [],
          meaning: '',
          syllables: null
        };
        namesByKey.set(key, entry);
        NAMES.push(entry);
      } else if (entry.gender !== (gender === 'girls' ? 'girl' : 'boy')) {
        entry.gender = 'either';
      }

      entry.popularIn = entry.popularIn || [];
      entry.popularIn.push({
        jurisdiction: ranking.jurisdiction,
        year: ranking.year,
        gender,
        position: index + 1
      });
    }
  }
}
