// Enhanced Service Catalog with multilingual support
// Shared between Vercel and Express servers
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {{
 *   id: string;
 *   groupId?: string;
 *   labels: Record<Locale, string>;
 *   descriptions: Record<Locale, string>;
 *   icon: string;
 *   keywords: Record<Locale, string[]>;
 *   typicalUnit?: 'hours' | 'items' | 'rooms' | 'sqm';
 *   subcategories?: string[];
 * }} ServiceDefinition
 */

/** @type {ServiceDefinition[]} */
export const SERVICE_CATALOG = [
  {
    id: 'moving-delivery',
    groupId: 'move-deliver',
    labels: {
      en: 'Moving & Delivery',
      sv: 'Flyttning & Leverans',
      de: 'Umzug & Lieferung',
      es: 'Mudanza y Entrega',
      fa: 'اسباب‌کشی و تحویل',
    },
    descriptions: {
      en: 'Helpers with cars or vans for moving, pickups, and drop-offs',
      sv: 'Hjälpare med bilar eller skåpbilar för flytt, upphämtning och lämnande',
      de: 'Helfer mit Autos oder Transportern für Umzüge, Abholungen und Lieferungen',
      es: 'Ayudantes con coches o furgonetas para mudanzas, recogidas y entregas',
      fa: 'کمک‌کنندگان با خودرو یا ون برای اسباب‌کشی، تحویل و بارگیری',
    },
    icon: '🚚',
    keywords: {
      en: ['moving', 'move', 'delivery', 'transport', 'van', 'truck', 'relocate', 'pickup', 'drop-off'],
      sv: ['flytt', 'flyttning', 'leverans', 'transport', 'skåpbil', 'lastbil', 'hämta', 'lämna'],
      de: ['umzug', 'umziehen', 'lieferung', 'transport', 'transporter', 'lkw', 'abholen', 'liefern'],
      es: ['mudanza', 'mudar', 'entrega', 'transporte', 'furgoneta', 'camión', 'recoger', 'entregar'],
      fa: ['اسباب‌کشی', 'حمل', 'تحویل', 'ترابری', 'ون', 'کامیون', 'بارگیری'],
    },
    typicalUnit: 'hours',
    subcategories: ['Small move', 'Furniture pickup', 'Store delivery'],
  },
  {
    id: 'remove-recycle',
    groupId: 'remove-recycle',
    labels: {
      en: 'Remove & Recycle',
      sv: 'Bortforsling & Återvinning',
      de: 'Entsorgung & Recycling',
      es: 'Eliminación y Reciclaje',
      fa: 'جمع‌آوری و بازیافت',
    },
    descriptions: {
      en: 'Junk removal, recycling center runs, and cleanouts',
      sv: 'Skräpbortforsling, återvinningskörningar och tömningar',
      de: 'Müllentsorgung, Recyclinghof-Fahrten und Entrümpelungen',
      es: 'Eliminación de basura, viajes al centro de reciclaje y limpiezas',
      fa: 'جمع‌آوری زباله، برد به مرکز بازیافت و تخلیه',
    },
    icon: '♻️',
    keywords: {
      en: ['remove', 'disposal', 'junk', 'recycle', 'trash', 'waste', 'cleanout', 'haul'],
      sv: ['bortforsling', 'sopor', 'skräp', 'återvinning', 'avfall', 'tömning'],
      de: ['entsorgung', 'müll', 'recycling', 'abfall', 'entrümpelung', 'abtransport'],
      es: ['eliminación', 'basura', 'reciclaje', 'desechos', 'limpieza', 'transporte'],
      fa: ['جمع‌آوری', 'زباله', 'بازیافت', 'آشغال', 'تخلیه'],
    },
    typicalUnit: 'items',
    subcategories: ['Electronics', 'Bulk waste', 'Donation runs'],
  },
  {
    id: 'buy-for-me',
    groupId: 'errands',
    labels: {
      en: 'Buy for Me',
      sv: 'Handla åt Mig',
      de: 'Für Mich Einkaufen',
      es: 'Comprar por Mí',
      fa: 'خرید برای من',
    },
    descriptions: {
      en: 'Errands, shopping, and click-and-collect help',
      sv: 'Ärenden, shopping och upphämtningshjälp',
      de: 'Besorgungen, Einkäufe und Abholhilfe',
      es: 'Recados, compras y ayuda con recogida',
      fa: 'خرید، کارهای روزمره و کمک برای دریافت',
    },
    icon: '🛍️',
    keywords: {
      en: ['buy', 'shopping', 'groceries', 'errands', 'pickup', 'collect', 'store'],
      sv: ['köpa', 'shopping', 'matvaror', 'ärenden', 'hämta', 'butik'],
      de: ['kaufen', 'einkaufen', 'lebensmittel', 'besorgungen', 'abholen', 'laden'],
      es: ['comprar', 'compras', 'comestibles', 'recados', 'recoger', 'tienda'],
      fa: ['خرید', 'خریدکردن', 'مواد‌غذایی', 'کارهای‌روزمره', 'دریافت'],
    },
    typicalUnit: 'hours',
    subcategories: ['Groceries', 'Store pickup', 'Essentials run'],
  },
  {
    id: 'assembly',
    groupId: 'home-help',
    labels: {
      en: 'Assembly',
      sv: 'Montering',
      de: 'Montage',
      es: 'Montaje',
      fa: 'مونتاژ',
    },
    descriptions: {
      en: 'Flat-pack and furniture assembly with tools',
      sv: 'Platt-paket och möbelmontering med verktyg',
      de: 'Flachpack- und Möbelmontage mit Werkzeugen',
      es: 'Montaje de muebles en kit con herramientas',
      fa: 'مونتاژ مبلمان و اثاثیه با ابزار',
    },
    icon: '🧰',
    keywords: {
      en: ['assembly', 'assemble', 'furniture', 'ikea', 'flat-pack', 'build', 'put together'],
      sv: ['montering', 'montera', 'möbel', 'ikea', 'platt-paket', 'bygga'],
      de: ['montage', 'montieren', 'möbel', 'ikea', 'aufbauen', 'zusammenbauen'],
      es: ['montaje', 'montar', 'muebles', 'ikea', 'armar', 'ensamblar'],
      fa: ['مونتاژ', 'سوارکردن', 'مبل', 'ایکیا', 'نصب'],
    },
    typicalUnit: 'items',
    subcategories: ['Furniture', 'Shelves', 'Beds'],
  },
  {
    id: 'mounting',
    groupId: 'home-help',
    labels: {
      en: 'Mounting & Installation',
      sv: 'Montering & Installation',
      de: 'Montage & Installation',
      es: 'Montaje e Instalación',
      fa: 'نصب و راه‌اندازی',
    },
    descriptions: {
      en: 'TVs, shelves, curtain rods, and fixtures',
      sv: 'TV, hyllor, gardinstänger och armaturer',
      de: 'Fernseher, Regale, Gardinenstangen und Armaturen',
      es: 'TVs, estantes, barras de cortina y accesorios',
      fa: 'تلویزیون، قفسه، میله‌پرده و لوازم',
    },
    icon: '🪛',
    keywords: {
      en: ['mount', 'mounting', 'install', 'installation', 'hang', 'tv', 'shelf', 'curtain', 'wall'],
      sv: ['montera', 'montering', 'installera', 'installation', 'hänga', 'tv', 'hylla', 'gardin', 'vägg'],
      de: ['montieren', 'montage', 'installieren', 'installation', 'aufhängen', 'fernseher', 'regal', 'vorhang', 'wand'],
      es: ['montar', 'montaje', 'instalar', 'instalación', 'colgar', 'tv', 'estante', 'cortina', 'pared'],
      fa: ['نصب', 'راه‌اندازی', 'آویزان‌کردن', 'تلویزیون', 'قفسه', 'پرده', 'دیوار'],
    },
    typicalUnit: 'items',
    subcategories: ['TV mounting', 'Curtains', 'Wall shelves'],
  },
  {
    id: 'cleaning',
    groupId: 'home-help',
    labels: {
      en: 'Cleaning',
      sv: 'Städning',
      de: 'Reinigung',
      es: 'Limpieza',
      fa: 'نظافت',
    },
    descriptions: {
      en: 'Home, office, and end-of-lease cleaning',
      sv: 'Hem, kontor och slutstädning',
      de: 'Haus-, Büro- und Endreinigung',
      es: 'Limpieza de hogar, oficina y fin de contrato',
      fa: 'نظافت خانه، اداره و پایان اجاره',
    },
    icon: '🧼',
    keywords: {
      en: ['clean', 'cleaning', 'tidy', 'scrub', 'vacuum', 'mop', 'dust', 'wash'],
      sv: ['städ', 'städning', 'rengöring', 'dammsuga', 'moppa', 'damma', 'tvätta'],
      de: ['reinigung', 'putzen', 'sauber', 'staubsaugen', 'wischen', 'waschen'],
      es: ['limpieza', 'limpiar', 'ordenar', 'aspirar', 'fregar', 'lavar'],
      fa: ['نظافت', 'تمیزکردن', 'مرتب‌کردن', 'جاروکردن', 'شستن'],
    },
    typicalUnit: 'rooms',
    subcategories: ['Home clean', 'Office clean', 'Deep clean'],
  },
  {
    id: 'yard',
    groupId: 'outdoor',
    labels: {
      en: 'Yardwork/Outdoor',
      sv: 'Trädgårdsarbete',
      de: 'Gartenarbeit',
      es: 'Trabajo de Jardín',
      fa: 'کار باغچه',
    },
    descriptions: {
      en: 'Garden help, leaves, snow, and outdoor tidy',
      sv: 'Trädgårdshjälp, löv, snö och utomhusröjning',
      de: 'Gartenhilfe, Laub, Schnee und Außenordnung',
      es: 'Ayuda de jardín, hojas, nieve y orden exterior',
      fa: 'کمک باغبانی، برف، برگ و مرتب‌سازی',
    },
    icon: '🌿',
    keywords: {
      en: ['yard', 'garden', 'lawn', 'mowing', 'leaves', 'snow', 'outdoor', 'grass'],
      sv: ['trädgård', 'gräsmatta', 'klippa', 'löv', 'snö', 'utomhus', 'gräs'],
      de: ['garten', 'rasen', 'mähen', 'laub', 'schnee', 'draußen', 'gras'],
      es: ['jardín', 'césped', 'cortar', 'hojas', 'nieve', 'exterior', 'hierba'],
      fa: ['باغچه', 'چمن', 'برف', 'برگ', 'بیرون'],
    },
    typicalUnit: 'hours',
    subcategories: ['Mowing', 'Leaf clear', 'Snow'],
  },
  {
    id: 'repairs',
    groupId: 'home-help',
    labels: {
      en: 'Home Repairs',
      sv: 'Hemreparationer',
      de: 'Hausreparaturen',
      es: 'Reparaciones del Hogar',
      fa: 'تعمیرات خانه',
    },
    descriptions: {
      en: 'Minor fixes, patching, and quick handyman tasks',
      sv: 'Mindre reparationer, lagning och snabba hantverkaruppgifter',
      de: 'Kleinreparaturen, Ausbesserungen und schnelle Handwerksarbeiten',
      es: 'Arreglos menores, parches y tareas rápidas de manitas',
      fa: 'تعمیرات جزئی، وصله‌کاری و کارهای سریع',
    },
    icon: '🔧',
    keywords: {
      en: ['repair', 'fix', 'broken', 'handyman', 'patch', 'maintenance'],
      sv: ['reparation', 'laga', 'trasig', 'hantverkare', 'lagning', 'underhåll'],
      de: ['reparatur', 'reparieren', 'kaputt', 'handwerker', 'ausbessern', 'wartung'],
      es: ['reparación', 'arreglar', 'roto', 'manitas', 'parche', 'mantenimiento'],
      fa: ['تعمیر', 'تعمیرات', 'خراب', 'درست‌کردن', 'نگهداری'],
    },
    typicalUnit: 'hours',
    subcategories: ['Minor repairs', 'Door fixes', 'Patch & paint'],
  },
  {
    id: 'painting',
    groupId: 'home-help',
    labels: {
      en: 'Painting',
      sv: 'Målning',
      de: 'Malerarbeiten',
      es: 'Pintura',
      fa: 'نقاشی',
    },
    descriptions: {
      en: 'Touch-ups and small room painting jobs',
      sv: 'Retuschering och målning av små rum',
      de: 'Ausbesserungen und kleine Malerarbeiten',
      es: 'Retoques y trabajos de pintura de habitaciones pequeñas',
      fa: 'رنگ‌آمیزی و رنگ‌کاری اتاق کوچک',
    },
    icon: '🎨',
    keywords: {
      en: ['paint', 'painting', 'touch-up', 'wall', 'ceiling', 'trim', 'color'],
      sv: ['målning', 'måla', 'retuschering', 'vägg', 'tak', 'list', 'färg'],
      de: ['malen', 'streichen', 'ausbesserung', 'wand', 'decke', 'leiste', 'farbe'],
      es: ['pintura', 'pintar', 'retoque', 'pared', 'techo', 'moldura', 'color'],
      fa: ['نقاشی', 'رنگ‌آمیزی', 'رنگ‌کاری', 'دیوار', 'سقف'],
    },
    typicalUnit: 'rooms',
    subcategories: ['Touch-up', 'Single room', 'Trim'],
  },
];

/**
 * Get service by ID
 * @param {string} serviceId
 * @returns {ServiceDefinition | undefined}
 */
export function getServiceById(serviceId) {
  return SERVICE_CATALOG.find(s => s.id === serviceId);
}

/**
 * Get localized service name
 * @param {string} serviceId
 * @param {Locale} locale
 * @returns {string}
 */
export function getServiceName(serviceId, locale) {
  const service = getServiceById(serviceId);
  return service?.labels[locale] || service?.labels.en || serviceId;
}

/**
 * Get all service IDs
 * @returns {string[]}
 */
export function getAllServiceIds() {
  return SERVICE_CATALOG.map(s => s.id);
}
