/* =====================================================================
   MAIRIE DE GRAND-POPO — App router & rendering
   Architecture : SPA légère, données → templates → DOM.
   Pages internes du mégamenu rendues par un template unifié + flip cards
   de navigation entre pages soeurs.
   ===================================================================== */

const TICKER = [
  'Portail officiel de la commune de Grand-Popo',
  'Conseil municipal extraordinaire — lundi 26 janvier 2026',
  'Prochain conseil communal — lundi 02 février 2026',
  'Fête de Nonvitcha 2026 — week-end de la Pentecôte',
  'Cité balnéaire du Sud-Ouest Bénin'
];

const NAV = [
  { label: 'Accueil', route: 'home' },
  { label: 'Ma commune', menu: 'commune' },
  { label: 'Municipalité', menu: 'mairie' },
  { label: 'Démarches', menu: 'services' },
  { label: 'Plus', menu: 'plus' }
];
const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="7" r="3"/><path d="M22 19c0-2.5-2-4.5-5-5"/></svg>',
  doc:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 14h6M9 18h4"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15.5v3a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19 19 0 0 1-6-6A19.5 19.5 0 0 1 1.3 3 2 2 0 0 1 3.3 1h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2L7 9a16 16 0 0 0 6 6l1.2-1.4a2 2 0 0 1 2-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.8 2.2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 16V11a6 6 0 0 0-12 0v5l-2 3h16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'
};

/* ============================== MENU STRUCTURE ============================== */

const MENU = {
  commune: {
    kicker: 'Ma commune', title: 'Grand-Popo, cité balnéaire',
    intro: 'Présentation, territoire, patrimoine et vie locale de la commune.',
    panels: [
      { title: 'Présentation', links: [
        { label: 'Présentation de la commune', route: 'commune-presentation' },
        { label: 'Les arrondissements', route: 'commune-arrondissements' },
        { label: 'Villages et villages traditionnels', route: 'commune-villages' }
      ]},
      { title: 'Patrimoine', links: [
        { label: 'Histoire et culture', route: 'commune-histoire' },
        { label: 'Patrimoine naturel', route: 'commune-patrimoine' },
        { label: 'Vie balnéaire', route: 'commune-balneaire' }
      ]},
      { title: 'Vivre ici', links: [
        { label: 'Cadre de vie', route: 'commune-presentation' },
        { label: 'Projets phares', route: 'citoyen-projets' }
      ]}
    ],
    feature: { title: 'Une commune ouverte sur le monde', text: 'Du fleuve Mono à l’océan Atlantique, Grand-Popo conjugue nature, culture et services de proximité.', route: 'commune-presentation', cta: 'Découvrir le territoire' }
  },
  mairie: {
    kicker: 'Ma municipalité', title: 'Le maire et les organes',
    intro: 'Une organisation lisible, des décisions transparentes, des services accessibles.',
    panels: [
      { title: 'Gouvernance', links: [
        { label: 'Le Maire et ses adjoints', route: 'mairie-maire' },
        { label: 'Le Conseil communal', route: 'mairie-conseil' }
      ]},
      { title: 'Organisation', links: [
        { label: 'Les commissions permanentes', route: 'mairie-commissions' },
        { label: 'Les organes techniques', route: 'mairie-technique' }
      ]},
      { title: 'Institutions', links: [
        { label: 'Conseil de supervision', route: 'mairie-supervision' },
        { label: 'Organes infra-communaux', route: 'mairie-infra' }
      ]}
    ],
    feature: { title: 'Un service public lisible', text: 'Du maire au service de quartier, une chaîne claire pour vos démarches.', route: 'mairie-maire', cta: 'Rencontrer le maire' }
  },
  services: {
    kicker: 'Mes démarches', title: 'L’e-guichet citoyen',
    intro: 'Effectuez vos démarches en ligne, suivez vos demandes et payez vos taxes sans déplacement.',
    panels: [
      { title: 'Civil & identité', links: [
        { label: 'État civil', route: 'services-etat-civil' },
        { label: 'Certificat d’hébergement', route: 'services-hebergement' }
      ]},
      { title: 'Domaine & terrain', links: [
        { label: 'Affaires domaniales', route: 'services-domanial' },
        { label: 'Occupation du domaine public', route: 'services-odp' }
      ]},
      { title: 'Économie', links: [
        { label: 'Diverses taxes', route: 'services-taxes' },
        { label: 'Équipements marchands', route: 'services-marches' },
        { label: 'Espace publicitaire', route: 'services-publicite' },
        { label: 'Stationnement', route: 'services-stationnement' }
      ]}
    ],
    feature: { title: 'Un guichet sans file d’attente', text: 'Préparez vos pièces, déposez votre demande, suivez son avancement en ligne.', route: 'services-etat-civil', cta: 'Démarrer une demande' }
  },
  decouvertes: {
    kicker: 'Mes découvertes', title: 'Vivez Grand-Popo',
    intro: 'Plages, fleuve Mono, mangroves et grands rendez-vous de la commune.',
    panels: [
      { title: 'Nature', links: [
        { label: 'Plages et littoral', route: 'decouvertes-plages' },
        { label: 'Fleuve Mono', route: 'decouvertes-mono' },
        { label: 'Mangroves', route: 'decouvertes-mangroves' }
      ]},
      { title: 'Culture', links: [
        { label: 'Fête de Nonvitcha', route: 'decouvertes-nonvitcha' },
        { label: 'Histoire et culture', route: 'commune-histoire' }
      ]},
      { title: 'Pratique', links: [
        { label: 'Hébergement et certificat', route: 'services-hebergement' }
      ]}
    ],
    feature: { title: 'Une cité à vivre', text: 'Le sable fin, le rythme du fleuve, les couleurs des fêtes communales.', route: 'decouvertes-plages', cta: 'Explorer la commune' }
  },
  citoyen: {
    kicker: 'Espace citoyen', title: 'Participer, signaler, suivre',
    intro: 'Forums, alertes, recrutement et projets : la mairie et les habitants en lien direct.',
    panels: [
      { title: 'Participation', links: [
        { label: 'Actualités & forums', route: 'citoyen-actualites' },
        { label: 'Signaler — alertes citoyennes', route: 'citoyen-signaler' }
      ]},
      { title: 'Opportunités', links: [
        { label: 'Recrutement', route: 'citoyen-recrutement' },
        { label: 'Projets phares', route: 'citoyen-projets' }
      ]},
      { title: 'Pratique', links: [
        { label: 'Écrire à la mairie', route: 'contact' },
        { label: 'Mentions légales', route: 'mentions' }
      ]}
    ],
    feature: { title: 'Un dialogue continu', text: 'Vos remarques nourrissent le travail des commissions et des services techniques.', route: 'citoyen-actualites', cta: 'Voir les actualités' }
  },
  plus: {
    kicker: 'Navigation', title: 'Accès rapides et secondaires',
    intro: 'Tout ce qui encombrait la barre principale est regroupé ici.',
    panels: [
      { title: 'Institution', links: [
        { label: 'Mairie', route: 'mairie-maire' },
        { label: 'Conseil communal', route: 'mairie-conseil' },
        { label: 'Contact', route: 'contact' }
      ]},
      { title: 'Démarches', links: [
        { label: 'E-guichet', route: 'services-etat-civil' },
        { label: 'État civil', route: 'services-etat-civil' },
        { label: 'Hébergement', route: 'services-hebergement' },
        { label: 'Taxes locales', route: 'services-taxes' }
      ]},
      { title: 'Découvertes', links: [
        { label: 'Plages', route: 'decouvertes-plages' },
        { label: 'Fleuve Mono', route: 'decouvertes-mono' },
        { label: 'Nonvitcha', route: 'decouvertes-nonvitcha' },
        { label: 'Espace citoyen', route: 'citoyen-actualites' }
      ]},
      { title: 'Pratique', links: [
        { label: 'Actualités', route: 'citoyen-actualites' },
        { label: 'Mentions légales', route: 'mentions' },
        { label: 'Écrire à la mairie', route: 'contact' }
      ]}
    ],
    feature: { title: 'Une barre plus respirante', text: 'Les accès utiles restent à portée, mais hors du bandeau principal.', route: 'contact', cta: 'Nous écrire' }
  },
};
/* ============================== HOME DATA ============================== */

const STATS = [
  { value: '289', suffix: 'km²', label: 'Superficie', icon: ICONS.pin },
  { value: '57', suffix: 'k+',   label: 'Habitants', icon: ICONS.users },
  { value: '12', suffix: '',     label: 'E-services', icon: ICONS.globe },
  { value: '08', suffix: '',     label: 'Arrondissements', icon: ICONS.doc }
];

const HERO_QUICK = [
  { label: 'État civil', route: 'services-etat-civil', mark: 'EC' },
  { label: 'Taxes locales', route: 'services-taxes', mark: 'TX' },
  { label: 'Hébergement', route: 'services-hebergement', mark: 'HB' },
  { label: 'Signaler', route: 'citoyen-signaler', mark: 'SG' }
];

const EVENTS = [
  { m: 'JAN', d: '26', t: 'Conseil municipal extraordinaire', loc: 'Hôtel de Ville · 10h' },
  { m: 'FÉV', d: '02', t: 'Conseil communal ordinaire', loc: 'Salle des délibérations · 9h' },
  { m: 'MAI', d: '24', t: 'Fête de Nonvitcha 2026', loc: 'Plage de Grand-Popo · weekend' }
];

const NEWS = [
  { img: 'assets/gbekon.jpg',  k: 'Aménagement', t: 'Inauguration des ouvrages de stabilisation de la berge de Gbèkon', x: 'Une cérémonie empreinte d’émotion et de fierté pour la livraison officielle des aménagements.' },
  { img: 'assets/jicem.jpg',   k: 'Coopération', t: 'Grand-Popo au cœur de l’engagement européen', x: 'Visite d’une délégation de l’Union européenne sur les projets financés dans la commune.' },
  { img: 'assets/lagoon.png',  k: 'Environnement', t: 'JICEM 2025 : protection des mangroves', x: 'La commune réaffirme son engagement pour la préservation des zones humides.' },
  { img: 'assets/facade.jpg',  k: 'Institution', t: 'Le portail numérique communal en service', x: 'Un nouvel outil pour rapprocher l’administration des habitants.' }
];

const HOME_FLIP = [
  { tag: 'Vivre', title: 'Habiter Grand-Popo', sub: 'Cadre de vie, services de proximité, écoles et santé.', back: { tag: 'Découvrir', title: 'Lecture du territoire', text: 'Présentation, arrondissements, villages : tout pour comprendre la commune.', cta: 'Voir Ma commune', route: 'commune-presentation' }, num: '01' },
  { tag: 'Démarches', title: 'Mes services en ligne', sub: 'État civil, foncier, taxes, hébergement.', back: { tag: 'E-guichet', title: 'Demandes et paiements', text: 'Préparez votre dossier, suivez l’instruction depuis votre espace.', cta: 'Aller à l’e-guichet', route: 'services-etat-civil' }, num: '02' },
  { tag: 'Découvrir', title: 'Plages, fleuve, fêtes', sub: 'Nonvitcha, Mono, mangroves et littoral atlantique.', back: { tag: 'Tourisme', title: 'Une cité à vivre', text: 'Du sable au festival, le territoire se raconte au fil des saisons.', cta: 'Voir les découvertes', route: 'decouvertes-plages' }, num: '03' },
  { tag: 'Agir', title: 'Espace citoyen', sub: 'Forums, projets, signalements et recrutement.', back: { tag: 'Participer', title: 'Au cœur de la vie locale', text: 'Une mairie en dialogue : vos retours nourrissent les décisions.', cta: 'Espace citoyen', route: 'citoyen-actualites' }, num: '04' }
];

/* ============================== PAGE CONTENT ============================== */

const PAGES = {
  /* ---------- COMMUNE ---------- */
  'commune-presentation': {
    section: 'commune', kicker: 'Présentation', image: 'assets/lagoon.png',
    title: 'Grand-Popo, commune balnéaire du Sud-Ouest',
    lead: 'Étendue entre le fleuve Mono et l’océan Atlantique, Grand-Popo cultive un équilibre rare entre nature, culture, pêche et tourisme.',
    blocks: [
      { type: 'prose', body: `
        <p>La commune de Grand-Popo, située dans le département du Mono, est une cité balnéaire dont le territoire s’étire le long du littoral atlantique sur près de 30 km de plage. Elle relie un cordon dunaire vif, une lagune côtière et le delta du fleuve Mono.</p>
        <h3>Une commune au cadre de vie exceptionnel</h3>
        <p>L’identité de Grand-Popo se construit autour de la pêche, du tourisme balnéaire, de l’agriculture maraîchère et d’un patrimoine culturel vivant — du <strong>vodun</strong> aux célébrations de la <strong>fête de Nonvitcha</strong>. Cet équilibre est aujourd’hui au cœur du projet communal.</p>
        <ul>
          <li>Un littoral atlantique propice aux activités balnéaires et à l’écotourisme.</li>
          <li>Un delta du fleuve Mono, écosystème de mangroves et zone de pêche traditionnelle.</li>
          <li>Une vie culturelle dense, marquée par les rendez-vous communaux annuels.</li>
        </ul>` },
      { type: 'facts', title: 'Repères de la commune', rows: [
        ['Département', 'Mono'],
        ['Préfecture', 'Lokossa'],
        ['Superficie', '289 km²'],
        ['Population', '≈ 57 000 habitants'],
        ['Arrondissements', '07'],
        ['Chef-lieu', 'Grand-Popo Centre']
      ]},
      { type: 'pull', text: 'Notre cité entame une mutation profonde. La digitalisation des services n’est qu’une étape d’un projet plus large pour Grand-Popo.', cite: 'Carlos Yao AYIKPE — Maire' }
    ]
  },
  'commune-arrondissements': {
    section: 'commune', kicker: 'Arrondissements', image: 'assets/facade.jpg',
    title: 'Sept arrondissements pour un service de proximité',
    lead: 'L’organisation territoriale de la commune répartit les 57 000 habitants entre sept arrondissements, chacun animé par un chef d’arrondissement et son équipe.',
    blocks: [
      { type: 'prose', body: `
        <p>Chaque arrondissement représente un échelon de proximité essentiel : il accompagne les démarches d’état civil, organise la vie locale, relaie les décisions du conseil communal et fait remonter les besoins du terrain.</p>
        <h3>Mission des arrondissements</h3>
        <ul>
          <li>Tenue des registres d’état civil de proximité.</li>
          <li>Organisation des opérations de salubrité, de sécurité et d’animation locale.</li>
          <li>Concertation avec les chefs de villages et de quartiers.</li>
          <li>Relais des décisions du conseil communal.</li>
        </ul>` },
      { type: 'facts', title: 'Les sept arrondissements', rows: [
        ['Grand-Popo Centre', 'Chef-lieu — services centralisés'],
        ['Adjaha', 'Front de mer Est'],
        ['Agoué', 'Frontière togolaise — pôle commercial'],
        ['Avlo', 'Pêche et tourisme'],
        ['Djanglanmey', 'Zone agricole intérieure'],
        ['Gbéhoué', 'Communautés de pêcheurs'],
        ['Sazué', 'Maraîchage et savane littorale']
      ]}
    ]
  },
  'commune-villages': {
    section: 'commune', kicker: 'Villages & quartiers', image: 'assets/gbekon.jpg',
    title: 'Une mosaïque de villages traditionnels',
    lead: 'Au-delà des arrondissements, la commune se lit dans ses villages — gardiens de la mémoire, des langues et des pratiques.',
    blocks: [
      { type: 'prose', body: `
        <p>Les villages structurent la vie quotidienne : pêche, agriculture, cérémonies, marchés. Ils sont aussi les conservatoires des langues locales (xwla, xwlassi, mina) et des liens entre l’océan et la lagune.</p>
        <h3>Une organisation coutumière vivante</h3>
        <p>Les chefs traditionnels et les conseils de village dialoguent en permanence avec la mairie pour orienter les politiques publiques et préserver le patrimoine immatériel.</p>` },
      { type: 'cards3', items: [
        { ico: 'GB', title: 'Gbèkon', text: 'Berge stabilisée, communauté de pêcheurs côtiers.' },
        { ico: 'AV', title: 'Avlo', text: 'Cordon littoral, pratiques de pêche en lagune.' },
        { ico: 'HE', title: 'Hêvê', text: 'Centre coutumier, mémoire vodun.' },
        { ico: 'AG', title: 'Agoué', text: 'Histoire afro-brésilienne et port frontalier.' }
      ]}
    ]
  },
  'commune-histoire': {
    section: 'commune', kicker: 'Histoire & culture', image: 'assets/lagoon.png',
    title: 'Une histoire tissée entre l’océan et la traite',
    lead: 'Carrefour des routes commerciales et culturelles, Grand-Popo conserve une mémoire afro-atlantique singulière.',
    blocks: [
      { type: 'prose', body: `
        <p>Du XVIᵉ au XIXᵉ siècle, la côte de Grand-Popo fut un point de contact intense entre les royaumes locaux, les marchands portugais, hollandais, danois et britanniques. La présence afro-brésilienne, à Agoué notamment, témoigne encore de ce passé.</p>
        <h3>Un patrimoine vivant</h3>
        <ul>
          <li><strong>Vodun</strong> et cérémonies traditionnelles tout au long de l’année.</li>
          <li>Architecture afro-brésilienne d’Agoué et bâtiments coloniaux du centre.</li>
          <li><strong>Nonvitcha</strong> : fête communale célébrée chaque Pentecôte.</li>
          <li>Musique, conte et danses (zinli, agbadja).</li>
        </ul>
        <h3>La mémoire au service du présent</h3>
        <p>Le projet culturel communal valorise ce patrimoine pour développer un tourisme respectueux et soutenir la transmission aux jeunes générations.</p>` },
      { type: 'pull', text: 'Grand-Popo n’est pas un décor : c’est une histoire qui se poursuit.', cite: 'Conseil culturel communal' }
    ]
  },
  'commune-patrimoine': {
    section: 'commune', kicker: 'Patrimoine naturel', image: 'assets/jicem.jpg',
    title: 'Le delta du Mono, un trésor à préserver',
    lead: 'Mangroves, lagune côtière, plages et zones humides : un écosystème exceptionnel reconnu et protégé.',
    blocks: [
      { type: 'prose', body: `
        <p>Le territoire communal abrite une partie significative de la <strong>réserve de biosphère du delta du Mono</strong>, classée par l’UNESCO. Ce statut engage la commune à concilier développement, économie locale et protection de la biodiversité.</p>
        <h3>Quatre milieux à protéger</h3>
        <ul>
          <li><strong>Le cordon littoral</strong> — sable, dunes, érosion à surveiller.</li>
          <li><strong>La lagune</strong> — pêche traditionnelle, qualité de l’eau.</li>
          <li><strong>Les mangroves</strong> — rôle climatique et nourricier majeur.</li>
          <li><strong>Le delta du Mono</strong> — biodiversité aviaire et aquatique.</li>
        </ul>` },
      { type: 'cards3', items: [
        { ico: 'MG', title: 'Mangroves', text: 'Plantations communales et suivi écologique.' },
        { ico: 'PL', title: 'Plages', text: 'Lutte contre l’érosion et nettoyage citoyen.' },
        { ico: 'BD', title: 'Biodiversité', text: 'Inventaires et sensibilisation des écoles.' },
        { ico: 'EA', title: 'Eau', text: 'Qualité de la lagune et des nappes côtières.' }
      ]}
    ]
  },
  'commune-balneaire': {
    section: 'commune', kicker: 'Vie balnéaire', image: 'assets/lagoon.png',
    title: 'La cité balnéaire, vivre face à l’océan',
    lead: 'Plage atlantique sur 30 km, lagune calme, lieux de baignade, restaurants et hébergements.',
    blocks: [
      { type: 'prose', body: `
        <p>La vocation balnéaire de Grand-Popo structure son économie touristique : hôtels, maisons d’hôtes, restaurants de spécialités locales et activités nautiques.</p>
        <h3>Un littoral à respecter</h3>
        <p>La commune accompagne les acteurs touristiques pour proposer une expérience qui respecte l’environnement, le rythme des villages côtiers et la sécurité des baigneurs.</p>` },
      { type: 'steps', items: [
        { t: 'S’informer', x: 'Contactez l’office du tourisme communal pour préparer votre séjour.' },
        { t: 'Se loger', x: 'Hôtels classés, maisons d’hôtes, hébergements communautaires.' },
        { t: 'Se baigner', x: 'Respectez les zones autorisées et la signalétique.' },
        { t: 'Repartir', x: 'Emportez vos déchets — chaque geste compte pour la plage.' }
      ]}
    ]
  },

  /* ---------- MAIRIE ---------- */
  'mairie-maire': {
    section: 'mairie', kicker: 'Le Maire', image: 'assets/mayor.jpg',
    title: 'M. Carlos Yao AYIKPE — Maire de Grand-Popo',
    lead: 'Premier citoyen de la commune, le maire porte le projet communal, anime le conseil et représente la mairie auprès des partenaires.',
    blocks: [
      { type: 'prose', body: `
        <p>Élu par le conseil communal, le maire conduit la politique de la commune avec ses adjoints. Il est garant de la transparence administrative, du dialogue citoyen et de la bonne exécution des décisions du conseil.</p>
        <h3>Missions principales</h3>
        <ul>
          <li>Représenter la commune dans la vie civile et institutionnelle.</li>
          <li>Préparer et exécuter les délibérations du conseil communal.</li>
          <li>Assurer la sécurité publique, la salubrité et la tranquillité.</li>
          <li>Officier d’état civil et autorité de police administrative.</li>
        </ul>` },
      { type: 'pull', text: 'Transparence, modernité, proximité : trois piliers pour chaque citoyen.', cite: 'Le Maire' },
      { type: 'cards3', items: [
        { ico: '1ᵉʳ', title: 'Premier adjoint', text: 'Affaires économiques et financières.' },
        { ico: '2ᵉ',  title: 'Deuxième adjoint', text: 'Affaires sociales, santé et éducation.' },
        { ico: '3ᵉ',  title: 'Troisième adjoint', text: 'Aménagement, foncier et travaux.' }
      ]}
    ]
  },
  'mairie-conseil': {
    section: 'mairie', kicker: 'Conseil communal', image: 'assets/facade.jpg',
    title: 'Le Conseil communal',
    lead: 'Organe délibérant de la commune, le conseil communal vote le budget, les programmes et les grandes orientations.',
    blocks: [
      { type: 'prose', body: `
        <p>Composé d’élus représentant les sept arrondissements, le conseil communal se réunit en sessions ordinaires et extraordinaires. Ses délibérations sont publiques et publiées sur le portail communal.</p>
        <h3>Calendrier des sessions</h3>
        <ul>
          <li><strong>Session extraordinaire</strong> — lundi 26 janvier 2026.</li>
          <li><strong>Session ordinaire</strong> — lundi 02 février 2026.</li>
          <li>Sessions trimestrielles tout au long de l’année.</li>
        </ul>
        <h3>Compétences</h3>
        <ul>
          <li>Vote du budget primitif et des comptes administratifs.</li>
          <li>Adoption du Plan de développement communal (PDC).</li>
          <li>Délibérations sur le foncier, les marchés et les services publics.</li>
        </ul>` }
    ]
  },
  'mairie-supervision': {
    section: 'mairie', kicker: 'Conseil de supervision', image: 'assets/jicem.jpg',
    title: 'Le Conseil de supervision',
    lead: 'Instance d’appréciation et d’évaluation, elle accompagne le suivi des projets et la qualité du service public.',
    blocks: [
      { type: 'prose', body: `
        <p>Le conseil de supervision réunit des représentants institutionnels, des partenaires techniques et des personnalités qualifiées. Il rend un avis périodique sur l’avancement des projets en cours.</p>
        <h3>Travaux récents</h3>
        <ul>
          <li>Évaluation des aménagements de berge à Gbèkon.</li>
          <li>Suivi des projets cofinancés par les partenaires européens.</li>
          <li>Appréciation de la digitalisation des services communaux.</li>
        </ul>` }
    ]
  },
  'mairie-commissions': {
    section: 'mairie', kicker: 'Commissions permanentes', image: 'assets/facade.jpg',
    title: 'Les commissions permanentes',
    lead: 'Les conseillers se répartissent en commissions thématiques pour préparer les délibérations.',
    blocks: [
      { type: 'cards3', items: [
        { ico: 'AF', title: 'Affaires financières', text: 'Budget, recettes, contrôle des dépenses.' },
        { ico: 'DS', title: 'Développement social', text: 'Santé, éducation, culture et jeunesse.' },
        { ico: 'AM', title: 'Aménagement', text: 'Foncier, urbanisme, travaux et environnement.' },
        { ico: 'EC', title: 'Économie locale', text: 'Marchés, tourisme, pêche et agriculture.' }
      ]},
      { type: 'prose', body: `
        <p>Chaque commission examine les dossiers en amont des sessions du conseil et formule un avis motivé. Les comptes-rendus sont publiés à l’issue des séances.</p>` }
    ]
  },
  'mairie-technique': {
    section: 'mairie', kicker: 'Organes techniques', image: 'assets/gbekon.jpg',
    title: 'Les services techniques',
    lead: 'L’administration communale met en œuvre, au quotidien, les décisions du conseil et accueille les usagers.',
    blocks: [
      { type: 'prose', body: `
        <p>Sous la responsabilité du Secrétaire général, les services techniques assurent la gestion courante de la commune : état civil, finances, aménagement, patrimoine, communication.</p>` },
      { type: 'cards3', items: [
        { ico: 'SG', title: 'Secrétariat général', text: 'Coordination de l’administration communale.' },
        { ico: 'EC', title: 'État civil', text: 'Naissances, mariages, décès, certificats.' },
        { ico: 'FI', title: 'Finances', text: 'Budget, comptabilité, recettes.' },
        { ico: 'TX', title: 'Services techniques', text: 'Voirie, assainissement, équipements.' }
      ]}
    ]
  },
  'mairie-infra': {
    section: 'mairie', kicker: 'Organes infra-communaux', image: 'assets/lagoon.png',
    title: 'Les organes infra-communaux',
    lead: 'Chefs d’arrondissement, chefs de village et de quartier : la chaîne de proximité.',
    blocks: [
      { type: 'prose', body: `
        <p>Les organes infra-communaux assurent une présence de la mairie au plus près des habitants : enregistrement de proximité, médiation, transmission des informations administratives.</p>
        <h3>Trois niveaux complémentaires</h3>
        <ul>
          <li><strong>Chef d’arrondissement</strong> — animation et coordination locale.</li>
          <li><strong>Chef de village ou de quartier</strong> — médiation traditionnelle.</li>
          <li><strong>Conseils de quartier</strong> — instances participatives.</li>
        </ul>` }
    ]
  },

  /* ---------- SERVICES ---------- */
  'services-etat-civil': {
    section: 'services', kicker: 'État civil', image: 'assets/facade.jpg',
    title: 'Naissance, mariage, décès — vos actes',
    lead: 'Demandez en ligne vos actes d’état civil. Préparez vos pièces justificatives et suivez votre demande depuis votre espace.',
    blocks: [
      { type: 'cards3', items: [
        { ico: 'NA', title: 'Acte de naissance', text: 'Copie intégrale ou extrait avec/sans filiation.' },
        { ico: 'MA', title: 'Acte de mariage', text: 'Copie intégrale ou extrait conforme.' },
        { ico: 'DC', title: 'Acte de décès', text: 'Copie intégrale destinée aux successions.' },
        { ico: 'CE', title: 'Certificats divers', text: 'Vie, célibat, individualité, hébergement.' }
      ]},
      { type: 'steps', items: [
        { t: 'Identifier l’acte', x: 'Sélectionnez le type d’acte et son année de référence.' },
        { t: 'Préparer les pièces', x: 'Pièce d’identité, justificatif de lien familial le cas échéant.' },
        { t: 'Déposer la demande', x: 'Remplissez le formulaire en ligne ou présentez-vous au guichet.' },
        { t: 'Retirer ou recevoir', x: 'Notification par SMS et e-mail dès que l’acte est prêt.' }
      ]},
      { type: 'cta', title: 'Lancer une demande d’acte', text: 'Munissez-vous de votre pièce d’identité et de la référence de l’acte.', actions: [
        { label: 'Faire ma demande', route: 'services-etat-civil', anchor: '#request-form', primary: true },
        { label: 'Contacter le service', route: 'contact' }
      ]}
    ],
    showForm: true
  },
  'services-hebergement': {
    section: 'services', kicker: 'Certificat d’hébergement', image: 'assets/facade.jpg',
    title: 'Certificat d’hébergement',
    lead: 'Document attestant qu’une personne est hébergée à une adresse précise sur le territoire communal.',
    blocks: [
      { type: 'prose', body: `
        <p>Le certificat d’hébergement est délivré par la mairie à la demande de la personne hébergeante. Il est nécessaire pour certaines démarches administratives, scolaires ou consulaires.</p>` },
      { type: 'cards3', items: [
        { ico: 'P1', title: 'Pièce d’identité', text: 'CNI ou passeport en cours de validité de l’hébergeant.' },
        { ico: 'P2', title: 'Justificatif de domicile', text: 'Facture récente d’électricité, d’eau ou bail.' },
        { ico: 'P3', title: 'Identité de l’hébergé', text: 'Pièce d’identité du bénéficiaire.' }
      ]},
      { type: 'cta', title: 'Demande en ligne', text: 'Renseignez les informations de l’hébergeant et de l’hébergé.', actions: [
        { label: 'Démarrer ma demande', route: 'services-hebergement', anchor: '#request-form', primary: true }
      ]}
    ],
    showForm: true
  },
  'services-domanial': {
    section: 'services', kicker: 'Affaires domaniales', image: 'assets/lagoon.png',
    title: 'Foncier et affaires domaniales',
    lead: 'Titres fonciers, autorisations d’occupation, demandes de bornage : la commune accompagne vos démarches.',
    blocks: [
      { type: 'prose', body: `
        <p>Le service des affaires domaniales gère les terrains du domaine communal et accompagne les particuliers dans la formalisation de leurs droits fonciers, en lien avec l’ANDF (Agence Nationale du Domaine et du Foncier).</p>` },
      { type: 'cards3', items: [
        { ico: 'TF', title: 'Titre foncier', text: 'Procédure de sécurisation des terrains.' },
        { ico: 'AC', title: 'Acte de cession', text: 'Validation des transactions foncières.' },
        { ico: 'AB', title: 'Bornage', text: 'Délimitation officielle des parcelles.' },
        { ico: 'CR', title: 'Cadastre', text: 'Consultation et mise à jour cadastrale.' }
      ]}
    ]
  },
  'services-odp': {
    section: 'services', kicker: 'Occupation du domaine public', image: 'assets/gbekon.jpg',
    title: 'Occupation du domaine public',
    lead: 'Demande d’autorisation pour occuper temporairement la voie publique : terrasse, événement, travaux.',
    blocks: [
      { type: 'cards3', items: [
        { ico: 'TR', title: 'Terrasse commerce', text: 'Installation saisonnière ou permanente.' },
        { ico: 'EV', title: 'Événement public', text: 'Manifestation culturelle ou sportive.' },
        { ico: 'CH', title: 'Chantier', text: 'Emprise temporaire pour travaux.' }
      ]},
      { type: 'steps', items: [
        { t: 'Décrire l’occupation', x: 'Type, lieu, surface et dates de l’occupation.' },
        { t: 'Joindre un plan', x: 'Croquis ou plan de situation de l’emprise.' },
        { t: 'Régler la redevance', x: 'Calcul automatique selon la grille communale.' },
        { t: 'Recevoir l’autorisation', x: 'Document à présenter en cas de contrôle.' }
      ]},
      { type: 'cta', title: 'Déposer une demande d’ODP', text: 'Anticipez votre dépôt au moins 15 jours avant l’occupation.', actions: [
        { label: 'Démarrer ma demande', route: 'services-odp', anchor: '#request-form', primary: true }
      ]}
    ],
    showForm: true
  },
  'services-taxes': {
    section: 'services', kicker: 'Diverses taxes', image: 'assets/facade.jpg',
    title: 'Taxes locales et redevances',
    lead: 'Réglez en ligne vos taxes communales et consultez votre situation fiscale.',
    blocks: [
      { type: 'facts', title: 'Principales taxes communales', rows: [
        ['Taxe foncière unique (TFU)', 'Selon la valeur locative du bien'],
        ['Taxe sur les activités économiques', 'Forfait selon nature et chiffre d’affaires'],
        ['Taxe de développement local', 'Quote-part communale'],
        ['Patente', 'Selon barème national'],
        ['Redevances de marché', 'Tarif journalier ou mensuel'],
        ['Droit de stationnement', 'Selon zone et durée']
      ]},
      { type: 'prose', body: `
        <p>Le recouvrement des taxes communales finance les services publics locaux : voirie, salubrité, équipements marchands, état civil. Les contribuables peuvent régler en ligne ou au guichet de la recette communale.</p>` },
      { type: 'cta', title: 'Régler en ligne', text: 'Consultez votre situation et payez par mobile money ou carte.', actions: [
        { label: 'Accéder au paiement', route: 'services-taxes', anchor: '#request-form', primary: true },
        { label: 'Contacter la recette', route: 'contact' }
      ]}
    ]
  },
  'services-marches': {
    section: 'services', kicker: 'Équipements marchands', image: 'assets/lagoon.png',
    title: 'Marchés et boutiques communaux',
    lead: 'Boutiques, hangars, étals : la commune gère les espaces dédiés au commerce local.',
    blocks: [
      { type: 'prose', body: `
        <p>Les équipements marchands constituent une ressource majeure pour la commune et un service essentiel pour les commerçants. La régie communale veille à l’entretien, à la sécurité et à l’équité d’accès.</p>` },
      { type: 'cards3', items: [
        { ico: 'BT', title: 'Boutique', text: 'Espace fermé en location à l’année.' },
        { ico: 'HA', title: 'Hangar', text: 'Espace ouvert avec couverture.' },
        { ico: 'ET', title: 'Étal', text: 'Place de marché à la journée.' }
      ]},
      { type: 'cta', title: 'Demander un emplacement', text: 'Adressez-vous à la régie des marchés ou déposez votre demande en ligne.', actions: [
        { label: 'Faire une demande', route: 'services-marches', anchor: '#request-form', primary: true }
      ]}
    ],
    showForm: true
  },
  'services-publicite': {
    section: 'services', kicker: 'Espace publicitaire', image: 'assets/facade.jpg',
    title: 'Affichage et publicité',
    lead: 'Autorisation d’installer un dispositif publicitaire sur le territoire communal.',
    blocks: [
      { type: 'prose', body: `
        <p>Toute installation publicitaire visible depuis l’espace public est soumise à autorisation préalable. La commune veille à la cohérence visuelle, à la sécurité et au respect des sites protégés.</p>` },
      { type: 'cards3', items: [
        { ico: 'PA', title: 'Panneau fixe', text: 'Installation pérenne sur structure.' },
        { ico: 'EN', title: 'Enseigne', text: 'Identification d’un commerce.' },
        { ico: 'BA', title: 'Banderole', text: 'Affichage temporaire événementiel.' }
      ]}
    ]
  },
  'services-stationnement': {
    section: 'services', kicker: 'Stationnement', image: 'assets/gbekon.jpg',
    title: 'Stationnement réglementé',
    lead: 'Zones de stationnement, droit de place et autorisations spécifiques.',
    blocks: [
      { type: 'facts', title: 'Tarifs en vigueur', rows: [
        ['Zone bleue — moto', '100 FCFA/jour'],
        ['Zone bleue — voiture', '300 FCFA/jour'],
        ['Place taxi-moto', 'Forfait mensuel selon arrondissement'],
        ['Stationnement événementiel', 'Sur autorisation préalable']
      ]},
      { type: 'prose', body: `
        <p>Le stationnement réglementé contribue à la fluidité de la circulation, à la sécurité des piétons et à la propreté du centre-ville. Les recettes financent l’entretien de la voirie communale.</p>` }
    ]
  },

  /* ---------- DECOUVERTES ---------- */
  'decouvertes-plages': {
    section: 'decouvertes', kicker: 'Plages & littoral', image: 'assets/lagoon.png',
    title: 'Trente kilomètres de littoral atlantique',
    lead: 'Sable doré, vagues longues, palmeraies bordant l’horizon : la côte de Grand-Popo s’étire sur près de 30 km.',
    blocks: [
      { type: 'prose', body: `
        <p>La plage de Grand-Popo est l’une des plus longues et des plus préservées du Bénin. Plusieurs zones sont aménagées pour la baignade, encadrées par des établissements classés.</p>
        <h3>Conseils baignade</h3>
        <ul>
          <li>Privilégiez les zones surveillées et signalées.</li>
          <li>Méfiez-vous des courants : la mer y est belle mais puissante.</li>
          <li>Respectez la propreté du site et les villages riverains.</li>
        </ul>` }
    ]
  },
  'decouvertes-mono': {
    section: 'decouvertes', kicker: 'Fleuve Mono', image: 'assets/jicem.jpg',
    title: 'Le fleuve Mono, frontière vivante',
    lead: 'Le Mono dessine la frontière naturelle avec le Togo et offre des paysages saisissants.',
    blocks: [
      { type: 'prose', body: `
        <p>Le delta du Mono mêle eau douce et eau salée, abrite une faune aquatique riche et donne vie à la pêche traditionnelle. Les pirogues circulent du matin au soir, témoins d’un savoir ancestral.</p>` },
      { type: 'cards3', items: [
        { ico: 'PI', title: 'Promenade en pirogue', text: 'Découverte des berges et des villages.' },
        { ico: 'PE', title: 'Pêche traditionnelle', text: 'Filets, nasses et techniques locales.' },
        { ico: 'OB', title: 'Observation oiseaux', text: 'Hérons, aigrettes, pélicans roses.' }
      ]}
    ]
  },
  'decouvertes-mangroves': {
    section: 'decouvertes', kicker: 'Mangroves', image: 'assets/jicem.jpg',
    title: 'Les mangroves, infrastructure naturelle',
    lead: 'Tampons climatiques, nourriciers de la biodiversité, atouts touristiques : les mangroves sont vitales.',
    blocks: [
      { type: 'prose', body: `
        <p>Grand-Popo et ses partenaires conduisent un programme continu de plantation et de protection des mangroves. La JICEM 2025 a réaffirmé cet engagement.</p>
        <h3>Pourquoi protéger les mangroves ?</h3>
        <ul>
          <li>Elles freinent l’érosion côtière et l’intrusion saline.</li>
          <li>Elles stockent massivement du carbone (« blue carbon »).</li>
          <li>Elles abritent les juvéniles de poissons et de crustacés.</li>
          <li>Elles offrent des paysages uniques pour l’écotourisme.</li>
        </ul>` }
    ]
  },
  'decouvertes-nonvitcha': {
    section: 'decouvertes', kicker: 'Nonvitcha', image: 'assets/lagoon.png',
    title: 'Nonvitcha, la fête communale',
    lead: 'Chaque Pentecôte, Grand-Popo célèbre Nonvitcha — moment de retrouvailles, de mémoire et de fête.',
    blocks: [
      { type: 'prose', body: `
        <p>Initiée au début du XXᵉ siècle par les ressortissants Xwla et Xwlassi de Cotonou, Nonvitcha rassemble aujourd’hui des dizaines de milliers de visiteurs. Conférences, concerts, rituels et grandes processions rythment le week-end.</p>
        <h3>Édition 2026</h3>
        <ul>
          <li><strong>Date</strong> — week-end de la Pentecôte (24 mai 2026).</li>
          <li><strong>Lieu</strong> — Grand-Popo Centre et villages environnants.</li>
          <li><strong>Programme</strong> — disponible un mois avant l’événement.</li>
        </ul>` }
    ]
  },

  /* ---------- CITOYEN ---------- */
  'citoyen-actualites': {
    section: 'citoyen', kicker: 'Actualités', image: 'assets/jicem.jpg',
    title: 'Toute l’actualité de la commune',
    lead: 'Décisions, événements, projets, alertes : restez informé en un coup d’œil.',
    blocks: [
      { type: 'newsfeed' },
      { type: 'prose', body: `
        <p>Les actualités sont publiées régulièrement par la cellule communication de la mairie. Vous pouvez vous abonner à la lettre d’information communale ou suivre les pages officielles.</p>` }
    ]
  },
  'citoyen-recrutement': {
    section: 'citoyen', kicker: 'Recrutement', image: 'assets/facade.jpg',
    title: 'Offres d’emploi et de stage',
    lead: 'La mairie publie ses offres ainsi que celles de partenaires intervenant sur le territoire.',
    blocks: [
      { type: 'prose', body: `
        <p>Toutes les opportunités professionnelles communales — recrutements, appels à manifestation d’intérêt, stages — sont relayées sur cette page. Les candidatures se déposent par voie électronique ou physique.</p>` },
      { type: 'cards3', items: [
        { ico: 'AG', title: 'Agent communal', text: 'Concours et recrutements internes.' },
        { ico: 'ST', title: 'Stages', text: 'Stages en mairie pour étudiants et jeunes diplômés.' },
        { ico: 'PA', title: 'Partenaires', text: 'Offres relayées par les acteurs présents sur la commune.' }
      ]}
    ]
  },
  'citoyen-projets': {
    section: 'citoyen', kicker: 'Projets phares', image: 'assets/gbekon.jpg',
    title: 'Les grands chantiers de la commune',
    lead: 'Aménagements, équipements, environnement : les projets structurants pour Grand-Popo.',
    blocks: [
      { type: 'cards3', items: [
        { ico: 'BR', title: 'Berges de Gbèkon', text: 'Stabilisation, livraison officielle effectuée.' },
        { ico: 'MG', title: 'Plantations mangroves', text: 'Programme communal pluriannuel.' },
        { ico: 'PO', title: 'Portail numérique', text: 'Refonte du site et ouverture de l’e-guichet.' },
        { ico: 'EQ', title: 'Équipements marchands', text: 'Extension et rénovation des marchés.' }
      ]},
      { type: 'pull', text: 'Chaque projet répond à une attente identifiée par les habitants ou par les commissions du conseil.', cite: 'Service planification' }
    ]
  },
  'citoyen-signaler': {
    section: 'citoyen', kicker: 'Signaler', image: 'assets/lagoon.png',
    title: 'Signaler ou alerter la mairie',
    lead: 'Voirie, éclairage, salubrité, danger : un signalement rapide pour une intervention efficace.',
    blocks: [
      { type: 'cards3', items: [
        { ico: 'VO', title: 'Voirie', text: 'Nid-de-poule, panneau abîmé, signalisation.' },
        { ico: 'EC', title: 'Éclairage', text: 'Lampadaire défectueux ou en panne.' },
        { ico: 'SA', title: 'Salubrité', text: 'Dépôt sauvage, eaux usées, hygiène publique.' },
        { ico: 'SE', title: 'Sécurité', text: 'Risque immédiat — précisez la nature.' }
      ]},
      { type: 'cta', title: 'Faire un signalement', text: 'Décrivez précisément le lieu et la nature du problème. Joignez une photo si possible.', actions: [
        { label: 'Envoyer un signalement', route: 'citoyen-signaler', anchor: '#request-form', primary: true }
      ]}
    ],
    showForm: true
  }
};

const SECTION_LABEL = {
  commune: 'Ma commune',
  mairie: 'Ma municipalité',
  services: 'Mes démarches',
  decouvertes: 'Mes découvertes',
  citoyen: 'Espace citoyen'
};

/* ============================== UTILS ============================== */

const app = { route: 'home', menu: null };
const $ = (sel, root = document) => root.querySelector(sel);

const tickerEl = $('#ticker-track');
const navEl = $('#nav-links');
const megaEl = $('#mega-menu');
const drawerEl = $('#mobile-drawer');
const drawerInnerEl = $('#mobile-drawer-inner');
const mainEl = $('#main-content');
const footerEl = $('#site-footer');
const toastEl = $('.toast');
const menuToggle = $('[data-menu-toggle]');

const esc = (s = '') => String(s)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

/* ============================== RENDER : NAV / MEGA / DRAWER ============================== */

const renderNav = () => NAV.map((item) => {
  if (item.menu) {
    return `<button type="button" class="nav-trigger" data-menu-group="${item.menu}" aria-haspopup="true" aria-expanded="false">${esc(item.label)} <span>${ICONS.chevron}</span></button>`;
  }
  return `<button type="button" class="nav-link" data-route="${item.route}">${esc(item.label)}</button>`;
}).join('');

const renderTicker = () => [...TICKER, ...TICKER].map((s) => `<span>${esc(s)}</span>`).join('');

const renderMega = (key) => {
  const m = MENU[key];
  return `<div class="mega-shell">
    <div class="mega-head">
      <div>
        <p class="eyebrow">${esc(m.kicker)}</p>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.intro)}</p>
      </div>
      <button type="button" class="mega-close" data-mega-close>Fermer</button>
    </div>
    <div class="mega-grid">
      ${m.panels.map((p) => `
        <div class="mega-panel">
          <h4>${esc(p.title)}</h4>
          ${p.links.map((l) => `<button type="button" class="mega-link" data-route="${l.route}">${esc(l.label)}</button>`).join('')}
        </div>`).join('')}
      <aside class="mega-feature">
        <p class="eyebrow on-dark">À l’honneur</p>
        <h4>${esc(m.feature.title)}</h4>
        <p>${esc(m.feature.text)}</p>
        <button type="button" class="feature-link" data-route="${m.feature.route}">${esc(m.feature.cta)} →</button>
      </aside>
    </div>
  </div>`;
};

const renderDrawer = () => `
  <div class="drawer-top">
    <p class="eyebrow no-rule" style="margin:0">Navigation</p>
    <button type="button" class="mega-close" data-drawer-close>Fermer</button>
  </div>
  ${NAV.map((item) => {
    if (item.menu) {
      const m = MENU[item.menu];
      return `<details class="drawer-group">
        <summary>${esc(item.label)}</summary>
        ${m.panels.map((p) => `
          <div class="drawer-panel">
            <p>${esc(p.title)}</p>
            ${p.links.map((l) => `<button type="button" data-route="${l.route}">${esc(l.label)}</button>`).join('')}
          </div>`).join('')}
      </details>`;
    }
    return `<button type="button" class="drawer-link" data-route="${item.route}">${esc(item.label)}</button>`;
  }).join('')}
`;

/* ============================== RENDER : HOME ============================== */

const flipCard = (c) => `
  <article class="flip-card" tabindex="0" data-flip-card>
    <div class="flip-inner">
      <div class="flip-face flip-front">
        <div>
          <span class="flip-tag">${esc(c.tag)}</span>
          <span class="num">${esc(c.num || '')}</span>
        </div>
        <div>
          <h3>${esc(c.title)}</h3>
          <p class="sub">${esc(c.sub || '')}</p>
        </div>
      </div>
      <div class="flip-face flip-back">
        <div>
          <span class="tag">${esc(c.back.tag)}</span>
          <h4>${esc(c.back.title)}</h4>
          <p>${esc(c.back.text)}</p>
        </div>
        <button type="button" class="card-button" data-route="${c.back.route}">${esc(c.back.cta)} →</button>
      </div>
    </div>
  </article>`;

const newsCard = (n) => `
  <article class="news-card">
    <div class="img"><img src="${esc(n.img)}" alt="${esc(n.t)}" loading="lazy" /></div>
    <div class="body">
      <span class="news-kicker">${esc(n.k)}</span>
      <h3>${esc(n.t)}</h3>
      <p>${esc(n.x)}</p>
    </div>
  </article>`;

const renderHome = () => `
<section class="view" data-view="home" id="home">
  <section class="hero">
    <div class="hero-bg" style="background-image:url('assets/lagoon.png')"></div>
    <div class="hero-shell">
      <div class="hero-head">
        <span class="hero-pill"><span class="dot"></span>Portail officiel · 2026</span>
      </div>
      <h1>L’excellence <em>au cœur</em> de la cité.</h1>
      <p class="hero-lead">La mairie de Grand-Popo digitalise vos démarches, valorise son patrimoine et rapproche les services publics des citoyens — en quelques clics.</p>
      <div class="hero-actions">
        <button type="button" class="primary-action" data-route="services-etat-civil">Accéder à l’e-guichet ${ICONS.arrow}</button>
        <button type="button" class="ghost-action" data-route="commune-presentation" style="color:#fff;border-color:rgba(255,255,255,.3)">Découvrir la commune</button>
      </div>
      <div class="hero-search">
        <span class="hero-search-icon">${ICONS.search}</span>
        <input type="search" placeholder="Rechercher un service, une démarche, une page…" aria-label="Rechercher" />
      </div>
      <div class="hero-quick">
        ${HERO_QUICK.map((q) => `<button type="button" data-route="${q.route}"><span class="ico">${esc(q.mark)}</span>${esc(q.label)}</button>`).join('')}
      </div>
    </div>
  </section>

  <section class="stats-band">
    <div class="stats-card">
      ${STATS.map((s) => `
        <div class="stat">
          <span class="stat-ico">${s.icon}</span>
          <div>
            <div class="stat-value">${esc(s.value)}<span class="suffix">${esc(s.suffix)}</span></div>
            <div class="stat-label">${esc(s.label)}</div>
          </div>
        </div>`).join('')}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow">Au programme</p>
          <h2>Quatre portes d’entrée vers la commune</h2>
        </div>
        <p class="meta">Cliquez ou survolez les cartes pour les retourner.</p>
      </div>
      <div class="flip-grid reveal">
        ${HOME_FLIP.map(flipCard).join('')}
      </div>
    </div>
  </section>

  <section class="section" style="background:linear-gradient(180deg, var(--paper) 0%, var(--paper-2) 100%);">
    <div class="container">
      <div class="mayor reveal">
        <div class="mayor-image">
          <img src="assets/mayor.jpg" alt="Carlos Yao AYIKPE, Maire de Grand-Popo" />
          <div class="mayor-badge">
            <div class="role">Le Maire</div>
            <div class="name">Carlos Yao AYIKPE</div>
          </div>
        </div>
        <div class="mayor-content">
          <p class="eyebrow">Mot du Premier citoyen</p>
          <h2>Construisons l’avenir, ensemble.</h2>
          <div class="mayor-quote">
            <p>« Notre cité entame une mutation profonde. La digitalisation de nos services n’est qu’une première étape d’une vision plus large. »</p>
            <p>« Transparence, modernité et proximité sont les piliers de notre action. »</p>
          </div>
          <div class="hero-actions">
            <button type="button" class="primary-action" data-route="mairie-maire">Découvrir l’équipe ${ICONS.arrow}</button>
            <button type="button" class="ghost-action" data-route="mairie-conseil">Voir le conseil</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="split-grid reveal">
        <aside>
          <div class="panel-head">
            <h4>Agenda local</h4>
            <button type="button" class="panel-link" data-route="citoyen-actualites">Tout voir</button>
          </div>
          <div class="events">
            ${EVENTS.map((e) => `
              <article class="event">
                <div class="event-date"><span class="m">${esc(e.m)}</span><span class="d">${esc(e.d)}</span></div>
                <div>
                  <h5>${esc(e.t)}</h5>
                  <p>${esc(e.loc)}</p>
                </div>
              </article>`).join('')}
          </div>
          <button type="button" class="ghost-action" data-route="citoyen-actualites" style="width:100%">Consulter l’agenda complet</button>
        </aside>
        <div>
          <div class="panel-head">
            <h4>Journal de la cité</h4>
            <button type="button" class="panel-link" data-route="citoyen-actualites">Voir les archives</button>
          </div>
          <div class="news-list">
            ${NEWS.slice(0, 2).map(newsCard).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow">Galerie</p>
          <h2>Quelques images du territoire</h2>
        </div>
        <p class="meta">Plages, lagune, patrimoine.</p>
      </div>
      <div class="gallery reveal">
        <figure><img src="assets/lagoon.png" alt="Lagune et océan" /><figcaption>Delta du Mono</figcaption></figure>
        <figure><img src="assets/facade.jpg" alt="Façade de la mairie" /><figcaption>Hôtel de ville</figcaption></figure>
        <figure><img src="assets/gbekon.jpg" alt="Berges de Gbèkon" /><figcaption>Berges de Gbèkon</figcaption></figure>
        <figure><img src="assets/jicem.jpg" alt="Mangroves" /><figcaption>JICEM 2025</figcaption></figure>
        <figure><img src="assets/mayor.jpg" alt="Le Maire" /><figcaption>Le Maire</figcaption></figure>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="cta-panel reveal">
        <div>
          <p class="eyebrow">Vous avez besoin d’aide ?</p>
          <h3>Un service du lundi au vendredi pour vous accompagner</h3>
          <p>Notre équipe est joignable au guichet, par téléphone ou par e-mail pour toute démarche communale.</p>
        </div>
        <div class="cta-actions">
          <button type="button" class="primary-action" data-route="contact">Nous écrire ${ICONS.arrow}</button>
          <button type="button" class="ghost-action" data-route="services-etat-civil">Voir les démarches</button>
        </div>
      </div>
    </div>
  </section>
</section>`;

/* ============================== RENDER : INTERNAL PAGE ============================== */

const renderBlock = (b, page) => {
  if (b.type === 'prose') return `<div class="prose">${b.body}</div>`;
  if (b.type === 'pull')  return `<aside class="pull"><p>« ${esc(b.text)} »</p><cite>${esc(b.cite)}</cite></aside>`;
  if (b.type === 'cards3') return `<div class="duo-grid">${b.items.map((i) => `
    <article class="info-card">
      <span class="ico">${esc(i.ico)}</span>
      <h4>${esc(i.title)}</h4>
      <p>${esc(i.text)}</p>
    </article>`).join('')}</div>`;
  if (b.type === 'steps') return `<div class="steps">${b.items.map((s) => `
    <div class="step"><div><h4>${esc(s.t)}</h4><p>${esc(s.x)}</p></div></div>`).join('')}</div>`;
  if (b.type === 'facts') return `<div>
    <p class="eyebrow">${esc(b.title)}</p>
    <table class="fact-table"><tbody>
      ${b.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
    </tbody></table></div>`;
  if (b.type === 'cta') return `<aside class="cta-panel">
    <div>
      <p class="eyebrow">À retenir</p>
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.text)}</p>
    </div>
    <div class="cta-actions">
      ${b.actions.map((a) => `<button type="button" class="${a.primary ? 'primary-action' : 'ghost-action'}" data-route="${a.route}"${a.anchor ? ` data-anchor="${a.anchor}"` : ''}>${esc(a.label)}${a.primary ? ' →' : ''}</button>`).join('')}
    </div></aside>`;
  if (b.type === 'newsfeed') return `<div class="news-list">${NEWS.map(newsCard).join('')}</div>`;
  return '';
};

const siblingFlip = (page, key) => {
  const sectionPages = Object.entries(PAGES)
    .filter(([k, p]) => p.section === page.section && k !== key);
  if (!sectionPages.length) return '';
  return `<section class="section section-tight">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow">Pages connexes</p>
          <h2>Naviguer dans ${esc(SECTION_LABEL[page.section])}</h2>
        </div>
        <p class="meta">Survolez ou cliquez pour retourner les cartes.</p>
      </div>
      <div class="flip-grid ${sectionPages.length === 2 ? 'two-up' : (sectionPages.length === 3 ? 'three-up' : '')}">
        ${sectionPages.slice(0, 6).map((entry, i) => {
          const [k, p] = entry;
          return flipCard({
            tag: p.kicker,
            num: String(i + 1).padStart(2, '0'),
            title: p.title.length > 38 ? p.title.slice(0, 38) + '…' : p.title,
            sub: p.lead.split('. ')[0] + '.',
            back: { tag: SECTION_LABEL[p.section], title: p.kicker, text: p.lead, cta: 'Ouvrir la page', route: k }
          });
        }).join('')}
      </div>
    </div>
  </section>`;
};

const renderInternalPage = (key) => {
  const page = PAGES[key];
  return `<section class="view" data-view="${key}" id="${key}" hidden>
    <section class="page-hero">
      <div class="page-hero-shell">
        <div class="reveal">
          <nav class="breadcrumb" aria-label="Fil d’Ariane">
            <button type="button" data-route="home">Accueil</button>
            <span class="sep">/</span>
            <span class="current">${esc(SECTION_LABEL[page.section])}</span>
            <span class="sep">/</span>
            <span class="current">${esc(page.kicker)}</span>
          </nav>
          <p class="eyebrow">${esc(page.kicker)}</p>
          <h1>${esc(page.title)}</h1>
          <p class="lead">${esc(page.lead)}</p>
          <div class="hero-actions" style="margin-top:1.4rem">
            <button type="button" class="primary-action" data-route="contact">Contacter le service</button>
            <button type="button" class="ghost-action" data-route="services-etat-civil">Voir l’e-guichet</button>
          </div>
        </div>
        <figure class="page-hero-image reveal">
          <img src="${esc(page.image)}" alt="${esc(page.title)}" loading="lazy" />
        </figure>
      </div>
    </section>

    <section class="section">
      <div class="container" style="display:grid; gap:2.5rem;">
        ${page.blocks.map((b) => `<div class="reveal">${renderBlock(b, page)}</div>`).join('')}
      </div>
    </section>

    ${page.showForm ? renderRequestForm(page.title) : ''}

    ${siblingFlip(page, key)}
  </section>`;
};

const renderRequestForm = (label) => `
  <section class="section section-tight" id="request-form">
    <div class="container">
      <div class="form-grid reveal">
        <div class="form-intro">
          <p class="eyebrow">Formulaire</p>
          <h2>Déposer ma demande</h2>
          <p class="lead">Remplissez ce formulaire pour ${esc(label)}. Un agent reviendra vers vous sous 48h ouvrées.</p>
          <div class="contact-cards" style="margin-top:1.5rem">
            <article class="contact-card"><span class="ico">${ICONS.phone}</span><div><div class="label">Téléphone</div><div class="value">+229 01 97 38 62 69</div></div></article>
            <article class="contact-card"><span class="ico">${ICONS.mail}</span><div><div class="label">E-mail</div><div class="value">contact@mairiegrandpopo.bj</div></div></article>
          </div>
        </div>
        <form class="request-form" id="service-request-form">
          <div class="row">
            <label>Nom<input type="text" name="nom" required /></label>
            <label>Prénom<input type="text" name="prenom" required /></label>
          </div>
          <div class="row">
            <label>Téléphone<input type="tel" name="tel" required /></label>
            <label>E-mail<input type="email" name="email" /></label>
          </div>
          <label>Service<select name="service" required>
            <option value="">Choisir un service</option>
            <option>État civil</option><option>Hébergement</option>
            <option>Affaires domaniales</option><option>Occupation domaine public</option>
            <option>Taxes locales</option><option>Équipements marchands</option>
            <option>Signalement citoyen</option><option>Autre</option>
          </select></label>
          <label>Détail de la demande<textarea name="message" rows="5" required placeholder="Précisez votre besoin en quelques lignes."></textarea></label>
          <button type="submit" class="primary-action">Envoyer ma demande →</button>
        </form>
      </div>
    </div>
  </section>`;

/* ============================== RENDER : CONTACT / MENTIONS ============================== */

const renderContact = () => `
<section class="view" data-view="contact" id="contact" hidden>
  <section class="page-hero">
    <div class="page-hero-shell">
      <div class="reveal">
        <nav class="breadcrumb"><button type="button" data-route="home">Accueil</button><span class="sep">/</span><span class="current">Contact</span></nav>
        <p class="eyebrow">Contact</p>
        <h1>Écrire à la mairie</h1>
        <p class="lead">Une question, une suggestion, une démarche ? Choisissez le canal qui vous convient.</p>
      </div>
      <figure class="page-hero-image reveal">
        <img src="assets/facade.jpg" alt="Hôtel de ville de Grand-Popo" />
      </figure>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="contact-grid reveal">
        <div class="contact-cards">
          <article class="contact-card"><span class="ico">${ICONS.pin}</span><div><div class="label">Adresse</div><div class="value">Centre-ville, Grand-Popo</div></div></article>
          <article class="contact-card"><span class="ico">${ICONS.phone}</span><div><div class="label">Téléphone</div><div class="value">+229 01 97 38 62 69</div></div></article>
          <article class="contact-card"><span class="ico">${ICONS.mail}</span><div><div class="label">E-mail</div><div class="value">contact@mairiegrandpopo.bj</div></div></article>
          <article class="contact-card"><span class="ico">${ICONS.bell}</span><div><div class="label">Horaires</div><div class="value">Lun.–Ven. · 8h–17h</div></div></article>
        </div>
        <form class="request-form" id="contact-form">
          <div class="row">
            <label>Nom complet<input type="text" name="name" required /></label>
            <label>E-mail<input type="email" name="email" required /></label>
          </div>
          <label>Objet<input type="text" name="subject" required /></label>
          <label>Service concerné<select name="service">
            <option>Accueil général</option>
            <option>État civil</option>
            <option>Affaires domaniales</option>
            <option>Taxes</option>
            <option>Communication</option>
          </select></label>
          <label>Message<textarea name="message" rows="6" required></textarea></label>
          <button type="submit" class="primary-action">Envoyer →</button>
        </form>
      </div>
    </div>
  </section>
</section>`;

const renderMentions = () => `
<section class="view" data-view="mentions" id="mentions" hidden>
  <section class="page-hero">
    <div class="page-hero-shell">
      <div class="reveal">
        <nav class="breadcrumb"><button type="button" data-route="home">Accueil</button><span class="sep">/</span><span class="current">Mentions légales</span></nav>
        <p class="eyebrow">Informations</p>
        <h1>Mentions légales & RGPD</h1>
        <p class="lead">Information éditeur, hébergement, propriété intellectuelle et protection des données.</p>
      </div>
      <figure class="page-hero-image reveal">
        <img src="assets/facade.jpg" alt="Mentions légales" />
      </figure>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="prose reveal">
        <h3>Éditeur du site</h3>
        <p>Mairie de Grand-Popo — Centre-ville, République du Bénin. Directeur de la publication : M. le Maire de Grand-Popo.</p>
        <h3>Hébergement</h3>
        <p>Le site est hébergé sur une infrastructure conforme aux exigences de sécurité et de disponibilité du service public.</p>
        <h3>Propriété intellectuelle</h3>
        <p>Les contenus (textes, images, graphismes) sont la propriété de la Mairie de Grand-Popo, sauf mention contraire. Toute reproduction sans autorisation est interdite.</p>
        <h3>Données personnelles</h3>
        <p>Les données collectées via les formulaires sont strictement utilisées pour traiter votre demande, conformément à la législation en vigueur en République du Bénin sur la protection des données.</p>
        <h3>Cookies</h3>
        <p>Le site utilise uniquement des cookies fonctionnels nécessaires au bon fonctionnement de la navigation.</p>
      </div>
    </div>
  </section>
</section>`;

/* ============================== RENDER : MAIN & FOOTER ============================== */

const renderMain = () => [
  renderHome(),
  ...Object.keys(PAGES).map(renderInternalPage),
  renderContact(),
  renderMentions()
].join('');

const renderFooter = () => `
  <div class="footer-shell">
    <div>
      <h2>Mairie de Grand-Popo</h2>
      <p>Portail officiel de la commune balnéaire du Sud-Ouest Bénin. Démarches, vie locale, patrimoine et information publique.</p>
      <div style="margin-top:1.4rem; display:flex; gap:.6rem;">
        <button type="button" class="primary-action sm" data-route="services-etat-civil">E-guichet</button>
        <button type="button" class="ghost-action sm" data-route="contact" style="color:#fff; border-color:rgba(255,255,255,.3)">Contact</button>
      </div>
    </div>
    <div class="footer-col">
      <p class="footer-eyebrow">Découvrir</p>
      <button type="button" data-route="commune-presentation">La commune</button>
      <button type="button" data-route="commune-arrondissements">Les arrondissements</button>
      <button type="button" data-route="commune-histoire">Histoire & culture</button>
      <button type="button" data-route="commune-patrimoine">Patrimoine naturel</button>
      <button type="button" data-route="decouvertes-nonvitcha">Nonvitcha</button>
    </div>
    <div class="footer-col">
      <p class="footer-eyebrow">Démarches</p>
      <button type="button" data-route="services-etat-civil">État civil</button>
      <button type="button" data-route="services-domanial">Affaires domaniales</button>
      <button type="button" data-route="services-taxes">Taxes locales</button>
      <button type="button" data-route="services-odp">Domaine public</button>
      <button type="button" data-route="services-marches">Marchés</button>
    </div>
    <div class="footer-col">
      <p class="footer-eyebrow">Coordonnées</p>
      <p>Centre-ville, Grand-Popo<br/>Mono · République du Bénin</p>
      <p>+229 01 97 38 62 69<br/>contact@mairiegrandpopo.bj</p>
      <p>Lun.–Ven. · 8h–17h</p>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Mairie de Grand-Popo — Tous droits réservés</span>
    <span>
      <button type="button" data-route="mentions" style="color:inherit;background:none;border:0;font:inherit;cursor:pointer">Mentions légales</button>
       ·
      <button type="button" data-route="mentions" style="color:inherit;background:none;border:0;font:inherit;cursor:pointer">Protection des données</button>
    </span>
  </div>`;

/* ============================== ROUTING ============================== */

const closeMega = () => {
  if (megaEl.hidden) return;
  megaEl.hidden = true;
  app.menu = null;
  document.querySelectorAll('[data-menu-group]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
};

const openMega = (group) => {
  if (app.menu === group && !megaEl.hidden) { closeMega(); return; }
  app.menu = group;
  megaEl.innerHTML = renderMega(group);
  megaEl.hidden = false;
  document.querySelectorAll('[data-menu-group]').forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.menuGroup === group)));
};

const openDrawer = () => {
  drawerEl.hidden = false;
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
};
const closeDrawer = () => {
  drawerEl.hidden = true;
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
};

const showToast = (m) => {
  toastEl.textContent = m;
  toastEl.hidden = false;
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => { toastEl.hidden = true; }, 2600);
};

const scrollToAnchor = (sel) => {
  const active = document.querySelector('.view.is-active');
  const el = (active && active.querySelector(sel)) || document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const setRoute = (route, opts = {}) => {
  const next = route || 'home';
  app.route = next;

  document.querySelectorAll('.view').forEach((v) => {
    const active = v.dataset.view === next;
    v.hidden = !active;
    v.classList.toggle('is-active', active);
  });

  document.querySelectorAll('[data-route]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.route === next);
  });

  // Menu trigger highlight
  if (PAGES[next]) {
    document.querySelectorAll('[data-menu-group]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.menuGroup === PAGES[next].section);
    });
  } else {
    document.querySelectorAll('[data-menu-group]').forEach((b) => b.classList.remove('is-active'));
  }

  history.replaceState(null, '', `#${next}`);
  if (opts.anchor) {
    setTimeout(() => scrollToAnchor(opts.anchor), 60);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeMega();
  if (opts.closeDrawer !== false) closeDrawer();

  observeReveals();
};

const validRoutes = new Set(['home', 'contact', 'mentions', ...Object.keys(PAGES)]);

/* ============================== REVEAL OBSERVER ============================== */

let revealObserver;
const observeReveals = () => {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });
  }
  document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
};

/* ============================== INIT ============================== */

const init = () => {
  tickerEl.innerHTML = renderTicker();
  navEl.innerHTML = renderNav();
  drawerInnerEl.innerHTML = renderDrawer();
  mainEl.innerHTML = renderMain();
  footerEl.innerHTML = renderFooter();

  const initial = (location.hash || document.body.dataset.route || '#home').replace('#', '');
  setRoute(validRoutes.has(initial) ? initial : 'home', { closeDrawer: false });

  menuToggle.addEventListener('click', () => {
    if (drawerEl.hidden) openDrawer(); else closeDrawer();
  });

  document.addEventListener('click', (event) => {
    // Boutons de fermeture explicites — priorité absolue
    if (event.target.closest('[data-mega-close]')) {
      event.preventDefault();
      closeMega();
      return;
    }
    if (event.target.closest('[data-drawer-close]')) {
      event.preventDefault();
      closeDrawer();
      return;
    }

    // Toggle de mégamenu sur le déclencheur
    const trigger = event.target.closest('[data-menu-group]');
    if (trigger) {
      event.preventDefault();
      openMega(trigger.dataset.menuGroup);
      return;
    }

    // Bouton de navigation
    const routeBtn = event.target.closest('[data-route]');
    if (routeBtn) {
      event.preventDefault();
      setRoute(routeBtn.dataset.route, { anchor: routeBtn.dataset.anchor || null });
      return;
    }

    // Bouton de scroll vers ancre
    const scrollBtn = event.target.closest('[data-scroll]');
    if (scrollBtn) { scrollToAnchor(scrollBtn.dataset.scroll); return; }

    // Toggle flip-card (sauf clic sur un bouton interne)
    const flip = event.target.closest('[data-flip-card]');
    if (flip && !event.target.closest('button')) {
      document.querySelectorAll('[data-flip-card].is-flipped').forEach((c) => {
        if (c !== flip) c.classList.remove('is-flipped');
      });
      flip.classList.toggle('is-flipped');
      return;
    }

    // Clic en dehors du mégamenu → fermer
    if (!megaEl.hidden && !event.target.closest('.mega-menu')) {
      closeMega();
    }
    // Clic en dehors du drawer mobile → fermer
    if (!drawerEl.hidden
        && !event.target.closest('.mobile-drawer-inner')
        && !event.target.closest('[data-menu-toggle]')) {
      closeDrawer();
    }
  });

  // Filet de sécurité : tout changement d’ancre ferme le mégamenu
  window.addEventListener('scroll', () => {
    if (!megaEl.hidden && Math.abs(window.scrollY) > 80) closeMega();
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    const flip = event.target.closest && event.target.closest('[data-flip-card]');
    if (flip && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      flip.classList.toggle('is-flipped');
    }
    if (event.key === 'Escape') {
      closeMega();
      closeDrawer();
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'service-request-form' || event.target.id === 'contact-form') {
      event.preventDefault();
      showToast('Demande envoyée — un agent vous recontacte sous 48h.');
      event.target.reset();
    }
  });

  window.addEventListener('hashchange', () => {
    const h = (location.hash || '#home').replace('#', '');
    setRoute(validRoutes.has(h) ? h : 'home', { closeDrawer: false });
  });
};

init();
