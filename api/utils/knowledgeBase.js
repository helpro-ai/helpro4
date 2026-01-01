// Knowledge Base for AI Assistant
// Built from FAQ.tsx, Services.tsx, and serviceCatalog.js
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {{
 *   id: string;
 *   keywords: Record<Locale, string[]>;
 *   answer: Record<Locale, string>;
 *   category: 'PRICING' | 'PAYMENTS' | 'SAFETY' | 'HOW_IT_WORKS' | 'SERVICES' | 'PLATFORM';
 * }} KBEntry
 */

/** @type {KBEntry[]} */
export const KNOWLEDGE_BASE = [
  {
    id: 'helper-payment',
    category: 'PAYMENTS',
    keywords: {
      en: ['payment', 'paid', 'pay helper', 'how do helpers get paid', 'when paid', 'money'],
      sv: ['betalning', 'betala', 'betalt', 'när får hjälpare betalt', 'pengar'],
      de: ['zahlung', 'bezahlt', 'bezahlen', 'helfer bezahlung', 'geld'],
      es: ['pago', 'pagado', 'pagar', 'dinero', 'cuándo se paga'],
      fa: ['پرداخت', 'پول', 'حق‌الزحمه', 'چگونه پرداخت', 'کی پرداخت'],
    },
    answer: {
      en: 'Helpers are paid after you mark the job complete. Payments are processed securely through the app.',
      sv: 'Hjälpare betalas efter att du markerat jobbet som slutfört. Betalningar behandlas säkert via appen.',
      de: 'Helfer werden bezahlt, nachdem Sie den Job als abgeschlossen markiert haben. Zahlungen werden sicher über die App abgewickelt.',
      es: 'Los ayudantes reciben el pago después de que marques el trabajo como completado. Los pagos se procesan de forma segura a través de la aplicación.',
      fa: 'کمک‌کنندگان بعد از تکمیل کار توسط شما پرداخت دریافت می‌کنند. پرداخت‌ها به صورت امن از طریق اپلیکیشن انجام می‌شود.',
    },
  },
  {
    id: 'price-change',
    category: 'PRICING',
    keywords: {
      en: ['change price', 'edit price', 'modify budget', 'update price', 'price after posting'],
      sv: ['ändra pris', 'redigera pris', 'ändra budget', 'uppdatera pris'],
      de: ['preis ändern', 'budget bearbeiten', 'preis aktualisieren'],
      es: ['cambiar precio', 'editar precio', 'modificar presupuesto'],
      fa: ['تغییر قیمت', 'ویرایش قیمت', 'تغییر بودجه'],
    },
    answer: {
      en: 'Yes, you can edit the budget until a helper accepts the job.',
      sv: 'Ja, du kan redigera budgeten tills en hjälpare accepterar jobbet.',
      de: 'Ja, Sie können das Budget ändern, bis ein Helfer den Job annimmt.',
      es: 'Sí, puedes editar el presupuesto hasta que un ayudante acepte el trabajo.',
      fa: 'بله، می‌توانید بودجه را تا زمانی که کمک‌کننده کار را بپذیرد ویرایش کنید.',
    },
  },
  {
    id: 'insurance',
    category: 'SAFETY',
    keywords: {
      en: ['insurance', 'insured', 'coverage', 'protection', 'liability'],
      sv: ['försäkring', 'försäkrad', 'täckning', 'skydd'],
      de: ['versicherung', 'versichert', 'deckung', 'schutz'],
      es: ['seguro', 'asegurado', 'cobertura', 'protección'],
      fa: ['بیمه', 'پوشش', 'حفاظت', 'بیمه شده'],
    },
    answer: {
      en: 'We support optional insurance add-ons for select categories. Contact support for details.',
      sv: 'Vi erbjuder valfria försäkringstillägg för utvalda kategorier. Kontakta support för detaljer.',
      de: 'Wir bieten optionale Versicherungszusätze für ausgewählte Kategorien an. Kontaktieren Sie den Support für Details.',
      es: 'Ofrecemos complementos de seguro opcionales para categorías seleccionadas. Contacta con soporte para más detalles.',
      fa: 'ما پوشش بیمه اختیاری برای دسته‌های خاص ارائه می‌دهیم. برای جزئیات با پشتیبانی تماس بگیرید.',
    },
  },
  {
    id: 'helper-verification',
    category: 'SAFETY',
    keywords: {
      en: ['verify', 'verification', 'background check', 'trusted', 'safe', 'reliable'],
      sv: ['verifiering', 'bakgrundskontroll', 'pålitlig', 'säker'],
      de: ['verifizierung', 'hintergrundprüfung', 'zuverlässig', 'sicher'],
      es: ['verificación', 'verificar', 'antecedentes', 'confiable', 'seguro'],
      fa: ['تایید', 'راستی‌آزمایی', 'بررسی سوابق', 'قابل اعتماد', 'امن'],
    },
    answer: {
      en: 'All helpers complete ID verification and build ratings from completed jobs. You can view helper profiles and reviews before booking.',
      sv: 'Alla hjälpare genomför ID-verifiering och bygger betyg från slutförda jobb. Du kan se hjälparprofiler och recensioner innan bokning.',
      de: 'Alle Helfer durchlaufen eine ID-Verifizierung und erhalten Bewertungen von abgeschlossenen Jobs. Sie können Helferprofile und Bewertungen vor der Buchung einsehen.',
      es: 'Todos los ayudantes completan la verificación de identidad y obtienen calificaciones de trabajos completados. Puedes ver perfiles y reseñas antes de reservar.',
      fa: 'همه کمک‌کنندگان تایید هویت انجام می‌دهند و از کارهای تکمیل شده امتیاز می‌گیرند. می‌توانید پروفایل و نظرات را قبل از رزرو مشاهده کنید.',
    },
  },
  {
    id: 'how-it-works-customer',
    category: 'HOW_IT_WORKS',
    keywords: {
      en: ['how it works', 'how to use', 'get started', 'process', 'steps', 'workflow'],
      sv: ['hur fungerar det', 'hur använder', 'komma igång', 'process', 'steg'],
      de: ['wie funktioniert', 'wie benutzen', 'erste schritte', 'prozess'],
      es: ['cómo funciona', 'cómo usar', 'empezar', 'proceso', 'pasos'],
      fa: ['چگونه کار می‌کند', 'چطور استفاده کنم', 'شروع', 'فرآیند', 'مراحل'],
    },
    answer: {
      en: '1) Post your service request with details. 2) Get offers from verified helpers. 3) Choose your helper. 4) They complete the job. 5) Pay after completion.',
      sv: '1) Lägg upp din serviceförfrågan med detaljer. 2) Få erbjudanden från verifierade hjälpare. 3) Välj din hjälpare. 4) De slutför jobbet. 5) Betala efter slutförande.',
      de: '1) Veröffentlichen Sie Ihre Serviceanfrage mit Details. 2) Erhalten Sie Angebote von verifizierten Helfern. 3) Wählen Sie Ihren Helfer. 4) Sie erledigen den Job. 5) Zahlung nach Abschluss.',
      es: '1) Publica tu solicitud de servicio con detalles. 2) Recibe ofertas de ayudantes verificados. 3) Elige tu ayudante. 4) Completan el trabajo. 5) Paga después de completarlo.',
      fa: '۱) درخواست خدمت خود را با جزئیات ثبت کنید. ۲) پیشنهادات از کمک‌کنندگان تایید شده دریافت کنید. ۳) کمک‌کننده خود را انتخاب کنید. ۴) آنها کار را تکمیل می‌کنند. ۵) بعد از تکمیل پرداخت کنید.',
    },
  },
  {
    id: 'service-moving',
    category: 'SERVICES',
    keywords: {
      en: ['moving', 'delivery', 'transport', 'van', 'truck', 'relocate', 'pickup'],
      sv: ['flytt', 'leverans', 'transport', 'skåpbil', 'lastbil'],
      de: ['umzug', 'lieferung', 'transport', 'transporter', 'lkw'],
      es: ['mudanza', 'entrega', 'transporte', 'furgoneta'],
      fa: ['اسباب‌کشی', 'تحویل', 'ترابری', 'حمل'],
    },
    answer: {
      en: 'Our moving & delivery service includes helpers with vehicles for small moves, furniture pickup, store deliveries, and more. Priced per hour or flat rate.',
      sv: 'Vår flytt- och leveransservice inkluderar hjälpare med fordon för små flyttar, möbelhämtning, butiksleveranser med mera. Pris per timme eller fast pris.',
      de: 'Unser Umzugs- und Lieferservice umfasst Helfer mit Fahrzeugen für kleine Umzüge, Möbelabholung, Ladenlieferungen und mehr. Preis pro Stunde oder Pauschalpreis.',
      es: 'Nuestro servicio de mudanza y entrega incluye ayudantes con vehículos para mudanzas pequeñas, recogida de muebles, entregas de tiendas y más. Precio por hora o tarifa plana.',
      fa: 'خدمات اسباب‌کشی و تحویل ما شامل کمک‌کنندگان با وسیله نقلیه برای اسباب‌کشی کوچک، تحویل مبل، تحویل فروشگاه و موارد دیگر است. قیمت ساعتی یا ثابت.',
    },
  },
  {
    id: 'service-cleaning',
    category: 'SERVICES',
    keywords: {
      en: ['cleaning', 'clean', 'tidy', 'scrub', 'vacuum', 'mop', 'home clean', 'office clean'],
      sv: ['städning', 'städa', 'rengöring', 'hemstäd', 'kontorsstäd'],
      de: ['reinigung', 'putzen', 'sauber', 'hausreinigung', 'büroreinigung'],
      es: ['limpieza', 'limpiar', 'ordenar', 'limpieza de hogar'],
      fa: ['نظافت', 'تمیزکردن', 'خانه‌تکانی', 'نظافت خانه', 'نظافت اداره'],
    },
    answer: {
      en: 'Cleaning services include home, office, and end-of-lease deep cleaning. Priced by room count or square meters. Helpers bring their own supplies.',
      sv: 'Städtjänster inkluderar hem, kontor och slutstädning. Pris per rum eller kvadratmeter. Hjälpare tar med egna förnödenheter.',
      de: 'Reinigungsdienste umfassen Haus-, Büro- und Endreinigung. Preis nach Raumanzahl oder Quadratmetern. Helfer bringen eigene Materialien mit.',
      es: 'Los servicios de limpieza incluyen hogar, oficina y limpieza profunda de fin de contrato. Precio por número de habitaciones o metros cuadrados. Los ayudantes traen sus propios suministros.',
      fa: 'خدمات نظافت شامل خانه، اداره و نظافت عمیق پایان اجاره است. قیمت بر اساس تعداد اتاق یا متر مربع. کمک‌کنندگان وسایل خود را می‌آورند.',
    },
  },
  {
    id: 'service-assembly',
    category: 'SERVICES',
    keywords: {
      en: ['assembly', 'assemble', 'furniture', 'ikea', 'flat-pack', 'build'],
      sv: ['montering', 'montera', 'möbel', 'ikea', 'platt-paket'],
      de: ['montage', 'montieren', 'möbel', 'ikea', 'aufbauen'],
      es: ['montaje', 'montar', 'muebles', 'ikea', 'armar'],
      fa: ['مونتاژ', 'سوارکردن', 'مبل', 'ایکیا', 'نصب'],
    },
    answer: {
      en: 'Assembly service covers flat-pack furniture, shelves, beds, and more. Helpers bring tools. Priced per item or hourly.',
      sv: 'Monteringsservice täcker platt-paket möbler, hyllor, sängar med mera. Hjälpare tar med verktyg. Pris per artikel eller timme.',
      de: 'Montageservice umfasst Flachpack-Möbel, Regale, Betten und mehr. Helfer bringen Werkzeuge mit. Preis pro Artikel oder Stunde.',
      es: 'El servicio de montaje cubre muebles en kit, estantes, camas y más. Los ayudantes traen herramientas. Precio por artículo o por hora.',
      fa: 'خدمات مونتاژ شامل مبلمان بسته‌بندی، قفسه، تخت و موارد دیگر است. کمک‌کنندگان ابزار می‌آورند. قیمت به ازای هر قطعه یا ساعتی.',
    },
  },
  {
    id: 'pricing-general',
    category: 'PRICING',
    keywords: {
      en: ['price', 'cost', 'how much', 'pricing', 'rate', 'fee', 'budget'],
      sv: ['pris', 'kostnad', 'hur mycket', 'prissättning', 'avgift', 'budget'],
      de: ['preis', 'kosten', 'wie viel', 'preisgestaltung', 'gebühr', 'budget'],
      es: ['precio', 'costo', 'cuánto', 'tarifa', 'presupuesto'],
      fa: ['قیمت', 'هزینه', 'چقدر', 'تعرفه', 'بودجه'],
    },
    answer: {
      en: 'Pricing varies by service type. You set your budget when posting. Helpers send offers, and you choose the best one. Most services range from 200-800 SEK/hour.',
      sv: 'Prissättningen varierar efter tjänsttyp. Du anger din budget vid inlägget. Hjälpare skickar erbjudanden och du väljer det bästa. De flesta tjänster kostar 200-800 SEK/timme.',
      de: 'Die Preise variieren je nach Servicetyp. Sie legen Ihr Budget beim Posten fest. Helfer senden Angebote und Sie wählen das beste. Die meisten Services kosten 200-800 SEK/Stunde.',
      es: 'Los precios varían según el tipo de servicio. Estableces tu presupuesto al publicar. Los ayudantes envían ofertas y tú eliges la mejor. La mayoría de servicios cuestan 200-800 SEK/hora.',
      fa: 'قیمت‌ها بسته به نوع خدمات متفاوت است. شما بودجه خود را هنگام ثبت تعیین می‌کنید. کمک‌کنندگان پیشنهاد ارسال می‌کنند و شما بهترین را انتخاب می‌کنید. بیشتر خدمات ۲۰۰-۸۰۰ کرون سوئد در ساعت است.',
    },
  },
  {
    id: 'become-helper',
    category: 'PLATFORM',
    keywords: {
      en: ['become helper', 'sign up helper', 'work as helper', 'earn money', 'helper signup'],
      sv: ['bli hjälpare', 'registrera hjälpare', 'arbeta som hjälpare', 'tjäna pengar'],
      de: ['helfer werden', 'als helfer arbeiten', 'geld verdienen'],
      es: ['ser ayudante', 'registrarse ayudante', 'trabajar como ayudante', 'ganar dinero'],
      fa: ['همکار شدن', 'ثبت نام کمک‌کننده', 'کار به عنوان کمک‌کننده', 'درآمد'],
    },
    answer: {
      en: 'To become a helper: 1) Complete ID verification. 2) Select your services and area. 3) Set your availability. 4) Start receiving booking requests. You keep 80-90% of the payment.',
      sv: 'För att bli hjälpare: 1) Genomför ID-verifiering. 2) Välj dina tjänster och område. 3) Ange din tillgänglighet. 4) Börja ta emot bokningsförfrågningar. Du behåller 80-90% av betalningen.',
      de: 'Um Helfer zu werden: 1) ID-Verifizierung abschließen. 2) Wählen Sie Ihre Dienste und Ihr Gebiet. 3) Legen Sie Ihre Verfügbarkeit fest. 4) Beginnen Sie, Buchungsanfragen zu erhalten. Sie behalten 80-90% der Zahlung.',
      es: 'Para ser ayudante: 1) Completa la verificación de identidad. 2) Selecciona tus servicios y área. 3) Establece tu disponibilidad. 4) Comienza a recibir solicitudes de reserva. Te quedas con el 80-90% del pago.',
      fa: 'برای همکار شدن: ۱) تایید هویت را تکمیل کنید. ۲) خدمات و منطقه خود را انتخاب کنید. ۳) در دسترس بودن خود را تعیین کنید. ۴) دریافت درخواست رزرو را شروع کنید. ۸۰-۹۰٪ پرداخت را نگه می‌دارید.',
    },
  },
];

/**
 * Normalize text for KB search
 * @param {string} text
 * @returns {string}
 */
function normalizeForKB(text) {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\u200c/g, ' ') // ZWNJ
    .replace(/[?!.,;:\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search knowledge base for relevant answer
 * @param {string} query
 * @param {Locale} locale
 * @returns {{entry: KBEntry, score: number} | null}
 */
export function searchKB(query, locale) {
  const normalizedQuery = normalizeForKB(query);
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);

  if (queryWords.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    const keywords = entry.keywords[locale] || entry.keywords.en;
    let score = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeForKB(keyword);

      // Exact match
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 10;
      }

      // Word matches
      const keywordWords = normalizedKeyword.split(' ');
      for (const qWord of queryWords) {
        for (const kWord of keywordWords) {
          if (qWord === kWord) score += 3;
          else if (qWord.includes(kWord) || kWord.includes(qWord)) score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Threshold: require at least some match
  return bestScore >= 5 ? { entry: bestMatch, score: bestScore } : null;
}
