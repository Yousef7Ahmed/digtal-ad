// بيانات المتجر المبدئية — مأخوذة من التصميم (client/src/data.js)
// الأسعار اتحوّلت لأرقام بالريال، و priceFrom معناها "يبدأ من".

export const CATEGORIES = [
  { name: "الطباعة والمطبوعات", icon: "📄", sortOrder: 1, description: "كروت، بروشورات، فلايرات، كتالوجات واستيكرات." },
  { name: "المنتجات الدعائية", icon: "🎁", sortOrder: 2, description: "أكواب، تيشيرتات، أقلام، نوت بوك وهدايا الشركات." },
  { name: "منتجات المعارض والفعاليات", icon: "🎪", sortOrder: 3, description: "رول أب، بوب أب، ستاندات، خلفيات وأعلام." },
  { name: "طباعة الصور", icon: "🖼️", sortOrder: 4, description: "كانفاس، ألبومات وإطارات خشبية." },
];

const img = (url) => [{ url, alt: "" }];

export const PRODUCTS = [
  // ===== الطباعة والمطبوعات =====
  {
    name: "كروت شخصية",
    category: "الطباعة والمطبوعات",
    basePrice: 50,
    priceFrom: true,
    isFeatured: true,
    shortDescription: "كروت شخصية بطباعة عالية الدقة وخامات فاخرة.",
    images: img("https://images.unsplash.com/photo-1589041127529-61922c2a0d9b?auto=format&fit=crop&q=80&w=800&h=600"),
    options: [
      {
        name: "الكمية",
        required: true,
        choices: [
          { label: "500 كارت", priceDelta: 0, isDefault: true },
          { label: "1000 كارت", priceDelta: 40 },
          { label: "2000 كارت", priceDelta: 110 },
        ],
      },
      {
        name: "نوع الورق",
        required: true,
        choices: [
          { label: "كوشيه 300 جرام", priceDelta: 0, isDefault: true },
          { label: "مطفي (Matte)", priceDelta: 15 },
          { label: "سوفت تاتش", priceDelta: 35 },
        ],
      },
    ],
  },
  {
    name: "بروشورات",
    category: "الطباعة والمطبوعات",
    basePrice: 150,
    priceFrom: true,
    shortDescription: "بروشورات بطيّات مختلفة تعرض خدماتك باحترافية.",
    images: img("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800&h=600"),
    options: [
      {
        name: "الطيّة",
        required: true,
        choices: [
          { label: "طيّة واحدة", priceDelta: 0, isDefault: true },
          { label: "3 طيّات", priceDelta: 60 },
        ],
      },
    ],
  },
  {
    name: "فلايرات",
    category: "الطباعة والمطبوعات",
    basePrice: 100,
    priceFrom: true,
    shortDescription: "فلايرات دعائية بألوان زاهية ومقاسات متعددة.",
    images: img("https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "كتالوجات",
    category: "الطباعة والمطبوعات",
    basePrice: 300,
    priceFrom: true,
    shortDescription: "كتالوجات منتجات بتجليد أنيق وورق فاخر.",
    images: img("https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "استيكرات",
    category: "الطباعة والمطبوعات",
    basePrice: 80,
    priceFrom: true,
    isFeatured: true,
    shortDescription: "استيكرات مقصوصة بأي شكل ومقاوِمة للماء.",
    images: img("https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=800&h=600"),
  },

  // ===== المنتجات الدعائية =====
  {
    name: "أكواب",
    category: "المنتجات الدعائية",
    basePrice: 25,
    priceFrom: true,
    shortDescription: "أكواب سيراميك مطبوعة بشعارك.",
    images: img("https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "تيشيرتات",
    category: "المنتجات الدعائية",
    basePrice: 45,
    priceFrom: true,
    isFeatured: true,
    shortDescription: "تيشيرتات مطبوعة بتقنية DTF عالية الثبات.",
    images: img("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800&h=600"),
    options: [
      {
        name: "المقاس",
        required: true,
        choices: [
          { label: "S", priceDelta: 0 },
          { label: "M", priceDelta: 0, isDefault: true },
          { label: "L", priceDelta: 0 },
          { label: "XL", priceDelta: 5 },
          { label: "XXL", priceDelta: 10 },
        ],
      },
    ],
  },
  {
    name: "أقلام",
    category: "المنتجات الدعائية",
    basePrice: 10,
    priceFrom: true,
    shortDescription: "أقلام دعائية محفور عليها اسم شركتك.",
    images: img("https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "نوت بوك",
    category: "المنتجات الدعائية",
    basePrice: 35,
    priceFrom: true,
    shortDescription: "دفاتر بغلاف مخصص بهوية علامتك.",
    images: img("https://images.unsplash.com/photo-1531346878377-a541e4a0ecce?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "هدايا الشركات",
    category: "المنتجات الدعائية",
    basePrice: 150,
    priceFrom: true,
    shortDescription: "أطقم هدايا متكاملة لعملائك وموظفينك.",
    images: img("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800&h=600"),
  },

  // ===== المعارض والفعاليات =====
  {
    name: "Roll-up",
    category: "منتجات المعارض والفعاليات",
    basePrice: 200,
    priceFrom: true,
    shortDescription: "بنر رول أب بحامل ألومنيوم وشنطة حمل.",
    images: img("https://images.unsplash.com/photo-1561489422-45de3d015e3e?auto=format&fit=crop&q=80&w=800&h=600"),
    options: [
      {
        name: "المقاس",
        required: true,
        choices: [
          { label: "80×200 سم", priceDelta: 0, isDefault: true },
          { label: "100×200 سم", priceDelta: 60 },
          { label: "120×200 سم", priceDelta: 120 },
        ],
      },
    ],
  },
  {
    name: "Pop-up",
    category: "منتجات المعارض والفعاليات",
    basePrice: 800,
    priceFrom: true,
    isFeatured: true,
    shortDescription: "خلفية بوب أب سريعة التركيب للمعارض.",
    images: img("https://images.unsplash.com/photo-1475721028070-281ce81b0a8e?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "Stand",
    category: "منتجات المعارض والفعاليات",
    basePrice: 400,
    priceFrom: true,
    shortDescription: "ستاندات عرض بمقاسات وخامات مختلفة.",
    images: img("https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "Backdrop",
    category: "منتجات المعارض والفعاليات",
    basePrice: 1200,
    priceFrom: true,
    shortDescription: "خلفيات تصوير وفعاليات بطباعة كاملة.",
    images: img("https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "Flags",
    category: "منتجات المعارض والفعاليات",
    basePrice: 150,
    priceFrom: true,
    shortDescription: "أعلام ريشة وقواعد ثابتة للأماكن المفتوحة.",
    images: img("https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=800&h=600"),
  },

  // ===== طباعة الصور =====
  {
    name: "طباعة صور كانفاس",
    category: "طباعة الصور",
    basePrice: 120,
    priceFrom: true,
    isFeatured: true,
    shortDescription: "طباعة صورك على قماش كانفاس بإطار خشبي.",
    images: img("https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "ألبومات صور",
    category: "طباعة الصور",
    basePrice: 250,
    priceFrom: true,
    shortDescription: "ألبومات مجلّدة بورق فاخر وتصميم مخصص.",
    images: img("https://images.unsplash.com/photo-1582201943021-e8e4b5ef6013?auto=format&fit=crop&q=80&w=800&h=600"),
  },
  {
    name: "إطارات صور خشبية",
    category: "طباعة الصور",
    basePrice: 90,
    priceFrom: true,
    shortDescription: "إطارات خشبية بمقاسات وألوان متعددة.",
    images: img("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800&h=600"),
  },
];
