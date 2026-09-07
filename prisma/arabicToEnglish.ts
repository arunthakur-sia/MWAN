// Deterministic Arabic → English translation for the synthetic dataset's fixed
// vocabulary (cities, regions, service types, legal forms, roles, positions,
// vehicle types) plus decomposable structures (company names, person names,
// addresses) built from a small set of recurring tokens. Everything the seed
// data can contain is covered by one of the maps/composers below — anything
// unrecognized falls back to the original Arabic string so a bad lookup never
// produces "undefined" in the UI.

export const CITY_EN: Record<string, string> = {
  "الطائف": "Taif",
  "الرياض": "Riyadh",
  "خميس مشيط": "Khamis Mushait",
  "الجبيل": "Jubail",
  "أبها": "Abha",
  "الباحة": "Al Bahah",
  "مكة المكرمة": "Makkah",
  "ينبع": "Yanbu",
  "جدة": "Jeddah",
  "نجران": "Najran",
  "تبوك": "Tabuk",
  "جازان": "Jazan",
  "حائل": "Hail",
  "الدمام": "Dammam",
  "المدينة المنورة": "Madinah",
};

export const REGION_EN: Record<string, string> = {
  "منطقة الرياض": "Riyadh Region",
  "منطقة تبوك": "Tabuk Region",
  "منطقة الباحة": "Al Bahah Region",
  "منطقة نجران": "Najran Region",
  "منطقة جازان": "Jazan Region",
  "منطقة مكة المكرمة": "Makkah Region",
  "منطقة المدينة المنورة": "Madinah Region",
  "منطقة عسير": "Asir Region",
  "منطقة حائل": "Hail Region",
  "المنطقة الشرقية": "Eastern Region",
};

// Shared by LMS "Service Type" and MOC "Activity Description" — same 7 values.
export const SERVICE_TYPE_EN: Record<string, string> = {
  "جمع ونقل النفايات غير الخطرة": "Collection and transport of non-hazardous waste",
  "جمع ونقل النفايات الخطرة": "Collection and transport of hazardous waste",
  "جمع ونقل نفايات البطاريات": "Collection and transport of battery waste",
  "جمع ونقل النفايات التجارية والإدارية": "Collection and transport of commercial and administrative waste",
  "جمع ونقل النفايات الكيميائية": "Collection and transport of chemical waste",
  "جمع ونقل نفايات الهدم والبناء": "Collection and transport of demolition and construction waste",
  "جمع ونقل النفايات القابلة لاعادة الاستخدام والتدوير": "Collection and transport of reusable and recyclable waste",
};

export const LEGAL_FORM_EN: Record<string, string> = {
  "شركة شخص واحد": "Single Person Company",
  "شركة تضامنية": "General Partnership Company",
  "شركة مساهمة مقفلة": "Closed Joint Stock Company",
  "شركة ذات مسؤولية محدودة": "Limited Liability Company",
  "مؤسسة فردية": "Sole Proprietorship",
};

export const SHAREHOLDER_ROLE_EN: Record<string, string> = {
  "شريك": "Partner",
  "مالك": "Owner",
};

export const DIRECTOR_POSITION_EN: Record<string, string> = {
  "عضو مجلس إدارة": "Board Member",
  "نائب المدير العام": "Deputy General Manager",
  "مدير عام": "General Manager",
  "رئيس مجلس الإدارة": "Chairman of the Board",
  "المدير التنفيذي": "Chief Executive Officer",
};

export const VEHICLE_TYPE_EN: Record<string, string> = {
  "شاحنة قلاب": "Dump Truck",
  "ناقلة سوائل": "Liquid Tanker",
  "شاحنة مضغوطة": "Compactor Truck",
  "شاحنة ذراع هيدروليكي": "Hydraulic Arm Truck",
  "شاحنة صندوقية": "Box Truck",
  "شاحنة مسطحة": "Flatbed Truck",
  "شاحنة خطاف": "Hook Lift Truck",
  "شاحنة حاويات": "Container Truck",
};

export const VEHICLE_CLASSIFICATION_EN: Record<string, string> = {
  "نقل مواد قابلة للتدوير": "Transport of recyclable materials",
  "نقل نفايات بناء وهدم": "Transport of construction and demolition waste",
  "نقل نفايات سائلة": "Transport of liquid waste",
  "نقل نفايات خطرة": "Transport of hazardous waste",
  "نقل نفايات صلبة": "Transport of solid waste",
};

export const PLATE_TYPE_EN: Record<string, string> = {
  "نقل عام": "Public Transport",
  "نقل خاص": "Private Transport",
  "خصوصي": "Private",
};

// ─── Person names ───────────────────────────────────────────────────────────
// The 46 shareholder/director names in the synthetic dataset are all built
// from these 63 first-name/family-name tokens (space-joined, 3 tokens each).
export const PERSON_TOKEN_EN: Record<string, string> = {
  // given names
  "أحمد": "Ahmed",
  "إبراهيم": "Ibrahim",
  "بدر": "Badr",
  "بندر": "Bandar",
  "تركي": "Turki",
  "حسن": "Hassan",
  "حمد": "Hamad",
  "خالد": "Khalid",
  "راشد": "Rashed",
  "سامي": "Sami",
  "سعد": "Saad",
  "سعود": "Saud",
  "سعيد": "Saeed",
  "سلطان": "Sultan",
  "سلمان": "Salman",
  "طارق": "Tariq",
  "طلال": "Talal",
  "عادل": "Adel",
  "عبدالرحمن": "Abdulrahman",
  "عبدالعزيز": "Abdulaziz",
  "عبدالله": "Abdullah",
  "عبد الله": "Abdullah",
  "علي": "Ali",
  "عمر": "Omar",
  "فهد": "Fahad",
  "فيصل": "Faisal",
  "ماجد": "Majed",
  "محمد": "Mohammed",
  "مشعل": "Mishal",
  "ناصر": "Nasser",
  "نايف": "Nayef",
  "نواف": "Nawaf",
  "هاني": "Hani",
  "يوسف": "Yousef",
  // family/tribal names
  "الأحمدي": "Al-Ahmadi",
  "الأنصاري": "Al-Ansari",
  "البقمي": "Al-Baqami",
  "البلوي": "Al-Balawi",
  "الثبيتي": "Al-Thubaiti",
  "الجهني": "Al-Juhani",
  "الحارثي": "Al-Harithi",
  "الحربي": "Al-Harbi",
  "الحسني": "Al-Hassani",
  "الدوسري": "Al-Dosari",
  "الرشيدي": "Al-Rashidi",
  "الزهراني": "Al-Zahrani",
  "السبيعي": "Al-Subaie",
  "السيد": "Al-Sayed",
  "الشريف": "Al-Sharif",
  "الشمري": "Al-Shammari",
  "الشهراني": "Al-Shahrani",
  "الشهري": "Al-Shehri",
  "العتيبي": "Al-Otaibi",
  "العمري": "Al-Omari",
  "العمودي": "Al-Amoudi",
  "العنزي": "Al-Anzi",
  "الغامدي": "Al-Ghamdi",
  "الفيفي": "Al-Fifi",
  "القحطاني": "Al-Qahtani",
  "القرشي": "Al-Qurashi",
  "اللحياني": "Al-Lahyani",
  "المالكي": "Al-Malki",
  "المحمدي": "Al-Muhammadi",
  "المطيري": "Al-Mutairi",
  "العمارى": "Al-Amari",
};

/** Translates a space-joined Arabic person name token-by-token; falls back to the original word for any unknown token. */
export function translatePersonName(name: string): string {
  return name
    .split(" ")
    .map((word) => PERSON_TOKEN_EN[word] ?? word)
    .join(" ");
}

// ─── Company names ──────────────────────────────────────────────────────────
// Company names follow "<prefix> <core> <suffix>", e.g.
// "شركة الاتحاد للحلول البيئية" = <شركة> <الاتحاد> <للحلول البيئية>.

const COMPANY_PREFIX_EN: Record<string, string> = {
  "شركة": "Company",
  "مؤسسة": "Est.",
  "مجموعة": "Group",
};

const COMPANY_CORE_EN: Record<string, string> = {
  "أمان العربية": "Arabian Safety",
  "اساس الاعمال": "Business Foundation",
  "افراس": "Afras",
  "الأساس": "Foundation",
  "الأصيل": "Al-Aseel",
  "الأفق": "Horizon",
  "الأمان": "Safety",
  "الأمل": "Hope",
  "الإتقان": "Precision",
  "الابتكار": "Innovation",
  "الاتحاد": "Union",
  "الازدهار": "Prosperity",
  "الانسجام": "Harmony",
  "البنيان": "Bunyan",
  "البيئة": "Environment",
  "التضامن": "Solidarity",
  "التعاون": "Cooperation",
  "التقدم": "Progress",
  "التكامل": "Integration",
  "التميز": "Excellence",
  "التوازن": "Balance",
  "الجودة": "Quality",
  "الحماية": "Protection",
  "الخضراء": "Green",
  "الدرع": "Shield",
  "الاستدامة": "Sustainability",
  "الرائد": "Pioneer",
  "الراسخ": "Steadfast",
  "الركيزة": "Cornerstone",
  "الريادة": "Leadership",
  "السعادة": "Happiness",
  "السلام": "Peace",
  "الشراكة": "Partnership",
  "الشروق": "Sunrise",
  "الصرح": "Edifice",
  "الصفاء": "Purity",
  "العزم": "Resolve",
  "العطاء": "Giving",
  "الفجر": "Dawn",
  "القمة": "Summit",
  "الكيان": "Kayan",
  "المتين": "Sturdy",
  "المسار": "Pathway",
  "المستقبل": "Future",
  "المنارة": "Lighthouse",
  "النجم": "Star",
  "النقاء": "Clarity",
  "النماء": "Growth",
  "النور": "Light",
  "الهمة": "Ambition",
  "الواحة": "Oasis",
  "الوطن": "Homeland",
  "الوفاء": "Loyalty",
  "تميز الأركان": "Pillars of Excellence",
  "سهول البيئه": "Environmental Plains",
  "عز البيارق": "Banners of Glory",
  "كيان": "Kayan",
  "نواقل الدولية": "International Carriers",
};

const COMPANY_SUFFIX_EN: Record<string, string> = {
  "لإدارة النفايات": "for Waste Management",
  "لتدوير المواد الاوليه": "for Recycling Raw Materials",
  "لتدوير النفايات": "for Waste Recycling",
  "للتجارة والمقاولات": "for Trading and Contracting",
  "للتجارة والنقل": "for Trading and Transport",
  "للتنظيف والنقل": "for Cleaning and Transport",
  "للحلول البيئية": "for Environmental Solutions",
  "للحلول المستدامة": "for Sustainable Solutions",
  "للخدمات البيئية": "for Environmental Services",
  "للخدمات العامة": "for General Services",
  "للخدمات اللوجستية": "for Logistics Services",
  "للخدمات المساندة": "for Support Services",
  "للمقاولات": "for Contracting",
  "للمقاولات البيئية": "for Environmental Contracting",
  "للمقاولات العامة": "for General Contracting",
  "للنظافة والنقل": "for Sanitation and Transport",
  "للنقل البيئي": "for Environmental Transport",
  "للنقليات": "for Transport",
  "لمعالجة النفايات": "for Waste Treatment",
};

// A handful of names don't fit the <prefix><core><suffix> template because the
// "core" is itself a person's name (e.g. "شركة حسن عبد الله العمارى").
const COMPANY_NAME_OVERRIDES: Record<string, string> = {
  "شركة حسن عبد الله العمارى": "Hassan Abdullah Al-Amari Company",
};

/**
 * Decomposes "<prefix> <core> <suffix>" company names into English using the
 * dictionaries above. Falls back to the original Arabic string when the name
 * doesn't match the known template (new/unseeded data, hand-entered names).
 */
const SINGLE_PERSON_SUFFIX = " شخص واحد";

export function translateCompanyName(name: string): string {
  if (COMPANY_NAME_OVERRIDES[name]) return COMPANY_NAME_OVERRIDES[name];

  if (name.endsWith(SINGLE_PERSON_SUFFIX)) {
    const base = translateCompanyName(name.slice(0, -SINGLE_PERSON_SUFFIX.length));
    return base === name.slice(0, -SINGLE_PERSON_SUFFIX.length) ? name : `${base} (Single Person)`;
  }

  const words = name.split(" ");
  const prefix = words[0];
  const prefixEn = COMPANY_PREFIX_EN[prefix];
  if (!prefixEn) return name;

  const rest = words.slice(1);
  const splitIdx = rest.findIndex((w) => w.startsWith("ل"));
  if (splitIdx === -1) return name;

  const core = rest.slice(0, splitIdx).join(" ");
  const suffix = rest.slice(splitIdx).join(" ");
  const coreEn = COMPANY_CORE_EN[core];
  const suffixEn = COMPANY_SUFFIX_EN[suffix];
  if (!coreEn || !suffixEn) return name;

  return `${coreEn} ${suffixEn} ${prefixEn}`;
}

// ─── Addresses ──────────────────────────────────────────────────────────────
// "<حي/شارع/طريق> <district>، <city>، مبنى <n>" or "المنطقة الصناعية، <city>، مبنى <n>"

const ADDRESS_PREFIX_EN: Record<string, string> = {
  "حي": "District",
  "شارع": "Street",
  "طريق": "Road",
};

const DISTRICT_EN: Record<string, string> = {
  "الأمير سلطان": "Prince Sultan",
  "البوادي": "Al Bawadi",
  "التحلية": "Al Tahlia",
  "الحمراء": "Al Hamra",
  "الرحاب": "Al Rehab",
  "الروضة": "Al Rawdah",
  "السلامة": "Al Salamah",
  "الشرفية": "Al Sharafiyah",
  "الصفا": "Al Safa",
  "العزيزية": "Al Aziziyah",
  "المروة": "Al Marwah",
  "الملك عبدالعزيز": "King Abdulaziz",
  "الملك فهد": "King Fahd",
  "النزهة": "Al Nuzha",
};

/**
 * Translates "حي X، City، مبنى N" style addresses. Falls back to the original
 * Arabic string for the city segment via `cityTranslate` so an unrecognized
 * city doesn't blank out an otherwise-translatable address.
 */
export function translateAddress(address: string): string {
  const segments = address.split("،").map((s) => s.trim());
  if (segments.length !== 3) return address;

  const [locationPart, city, buildingPart] = segments;

  let locationEn: string;
  if (locationPart === "المنطقة الصناعية") {
    locationEn = "Industrial Area";
  } else {
    const [prefix, ...districtWords] = locationPart.split(" ");
    const district = districtWords.join(" ");
    const prefixEn = ADDRESS_PREFIX_EN[prefix];
    const districtEn = DISTRICT_EN[district];
    if (!prefixEn || !districtEn) return address;
    locationEn = `${districtEn} ${prefixEn}`;
  }

  const cityEn = CITY_EN[city] ?? city;
  const buildingMatch = buildingPart.match(/^مبنى\s+(.+)$/);
  const buildingEn = buildingMatch ? `Building ${buildingMatch[1]}` : buildingPart;

  return `${locationEn}, ${cityEn}, ${buildingEn}`;
}
