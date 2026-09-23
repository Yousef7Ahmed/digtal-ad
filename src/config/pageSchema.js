/**
 * مخطّط محتوى الصفحات.
 *
 * كل حقل هنا بيظهر في صفحة "محتوى الصفحات" في الداشبورد ويتعدّل من غير ما تلمس الكود.
 * عايز تضيف نص جديد قابل للتعديل؟ ضيف الحقل هنا، وفي الصفحة استخدم:
 *   {t("hero.title", "النص الافتراضي")}     للنصوص
 *   <img src={img("hero.image", DEFAULT_URL)} />   للصور
 *
 * type: text | textarea | image
 */

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1541888081622-1bc32c3fde44?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=1920&h=1080&fit=crop",
];

export const PAGE_SCHEMA = [
  // ===================== الرئيسية =====================
  {
    key: "home",
    title: "الصفحة الرئيسية",
    path: "/",
    icon: "dashboard",
    sections: [
      {
        title: "الواجهة الأولى (الهيرو)",
        fields: [
          { key: "hero.badge", label: "الشارة فوق العنوان", type: "text", default: "🚀 وكالة الإعلان الرقمي منذ 2017" },
          { key: "hero.title1", label: "العنوان — أول كلمة", type: "text", default: "نُطوِّر" },
          { key: "hero.titleHighlight", label: "العنوان — الكلمة الملوّنة", type: "text", default: "تواجدك الرقمي" },
          { key: "hero.title2", label: "العنوان — باقي الجملة", type: "text", default: "بأساليب مبتكرة" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default:
              "نساعد الشركات والأعمال التجارية على تعزيز وترويج منتجاتها وخدماتها بطرق فعالة وجذابة تحقق نتائج حقيقية.",
          },
          { key: "hero.primaryCta", label: "زرار الإجراء الأساسي", type: "text", default: "اطلب خدمة الآن" },
          { key: "hero.secondaryCta", label: "زرار الإجراء الثاني", type: "text", default: "اكتشف خدماتنا" },
          { key: "hero.image1", label: "صورة الخلفية الأولى", type: "image", default: HERO_IMAGES[0] },
          { key: "hero.image2", label: "صورة الخلفية الثانية", type: "image", default: HERO_IMAGES[1] },
          { key: "hero.image3", label: "صورة الخلفية الثالثة", type: "image", default: HERO_IMAGES[2] },
        ],
      },
      {
        title: "قسم الخدمات",
        fields: [
          { key: "services.label", label: "العنوان الصغير", type: "text", default: "ما نقدمه" },
          { key: "services.title", label: "العنوان الرئيسي", type: "text", default: "خدماتنا المتكاملة" },
          {
            key: "services.subtitle",
            label: "الوصف",
            type: "textarea",
            default: "نقدم مجموعة شاملة من خدمات الدعاية والإعلان الرقمي",
          },
          { key: "services.cta", label: "زرار أسفل القسم", type: "text", default: "عرض جميع الخدمات" },
        ],
      },
      {
        title: "قسم الأعمال",
        fields: [
          { key: "works.label", label: "العنوان الصغير", type: "text", default: "إنجازاتنا" },
          { key: "works.title", label: "العنوان الرئيسي", type: "text", default: "أحدث أعمالنا" },
          { key: "works.cta", label: "زرار أسفل القسم", type: "text", default: "عرض جميع الأعمال" },
        ],
      },
      {
        title: "قسم الكروت المميزة",
        hint: 'ده عنوان القسم بس. الكروت نفسها (الصور والكلام اللي فوقها) بتتظبط من صفحة "كروت الرئيسية".',
        fields: [
          { key: "cards.label", label: "العنوان الصغير", type: "text", default: "مختارات" },
          { key: "cards.title", label: "العنوان الرئيسي", type: "text", default: "أبرز ما نقدمه" },
          {
            key: "cards.subtitle",
            label: "الوصف",
            type: "textarea",
            default: "نخبة من خدماتنا ومنتجاتنا الأكثر طلبًا",
          },
        ],
      },
      {
        title: "قسم آراء العملاء",
        fields: [
          { key: "testimonials.label", label: "العنوان الصغير", type: "text", default: "آراء عملائنا" },
          { key: "testimonials.title", label: "العنوان الرئيسي", type: "text", default: "ماذا يقول عملاؤنا؟" },
        ],
      },
      {
        title: "قسم الدعوة للتواصل",
        fields: [
          { key: "cta.title", label: "العنوان", type: "text", default: "هل أنت مستعد لتطوير علامتك التجارية؟" },
          { key: "cta.subtitle", label: "النص", type: "text", default: "تواصل معنا اليوم واحصل على استشارة مجانية" },
          { key: "cta.button", label: "الزرار", type: "text", default: "احصل على استشارة مجانية" },
        ],
      },
    ],
  },

  // ===================== الحلول الرقمية =====================
  {
    key: "solutions",
    title: "الحلول الرقمية",
    path: "/solutions",
    icon: "spark",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "الأنظمة والمنتجات الرقمية" },
          { key: "hero.title1", label: "العنوان — السطر الأول", type: "text", default: "حلول برمجية مبتكرة" },
          { key: "hero.title2", label: "العنوان — السطر الملوّن", type: "text", default: "لتحقيق رؤيتك الرقمية" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default:
              "من تصميم واجهات المستخدم الجذابة إلى تطوير أنظمة إدارة الموارد المعقدة (ERP). نحن في Digital AD نقدم باقة متكاملة من المنتجات الرقمية لتطوير أعمالك.",
          },
          { key: "hero.primaryCta", label: "الزرار الأساسي", type: "text", default: "اطلب حلاً برمجياً" },
          { key: "hero.secondaryCta", label: "الزرار الثاني", type: "text", default: "اكتشف الحلول" },
        ],
      },
      {
        title: "الخدمات البرمجية",
        fields: [
          { key: "list.title", label: "عنوان القسم", type: "text", default: "خدماتنا البرمجية" },
          { key: "card1.title", label: "الكارت الأول — العنوان", type: "text", default: "تصميم واجهات وتجربة المستخدم (UI/UX)" },
          {
            key: "card1.desc",
            label: "الكارت الأول — الوصف",
            type: "textarea",
            default:
              "نصمم واجهات رقمية جذابة وسهلة الاستخدام تركز على تلبية احتياجات المستخدمين وتحقيق أهداف أعمالك. نحول الأفكار المعقدة إلى تجارب تفاعلية ممتعة.",
          },
          { key: "card2.title", label: "الكارت الثاني — العنوان", type: "text", default: "تطوير المواقع الإلكترونية" },
          {
            key: "card2.desc",
            label: "الكارت الثاني — الوصف",
            type: "textarea",
            default:
              "نبني مواقع ويب سريعة، آمنة، ومتجاوبة مع جميع الأجهزة. سواء كنت تحتاج إلى موقع تعريفي لشركتك أو منصة تجارة إلكترونية معقدة، نحن هنا لتنفيذها.",
          },
          { key: "card3.title", label: "الكارت الثالث — العنوان", type: "text", default: "أنظمة تخطيط الموارد (ERP Systems)" },
          {
            key: "card3.desc",
            label: "الكارت الثالث — الوصف",
            type: "textarea",
            default:
              "حلول برمجية متكاملة لإدارة جميع أقسام وموارد شركتك من مكان واحد. نخصص النظام ليناسب حجم أعمالك ويساعدك في أتمتة العمليات وزيادة الإنتاجية.",
          },
          { key: "list.cardCta", label: "رابط الكروت", type: "text", default: "طلب الخدمة" },
        ],
      },
      {
        title: "كارت المتجر",
        fields: [
          { key: "store.label", label: "العنوان الصغير", type: "text", default: "جاهزة للاستخدام" },
          { key: "store.title", label: "العنوان", type: "text", default: "قوالب ومنتجات جاهزة" },
          {
            key: "store.text",
            label: "النص",
            type: "textarea",
            default:
              "نوفر مجموعة واسعة من القوالب البرمجية والمنتجات الرقمية الجاهزة في متجرنا. اختصر الوقت وابدأ مشروعك الآن.",
          },
          { key: "store.button", label: "الزرار", type: "text", default: "تصفح المتجر" },
        ],
      },
      {
        title: "كارت الأعمال",
        fields: [
          { key: "works.label", label: "العنوان الصغير", type: "text", default: "سجل الإنجازات" },
          { key: "works.title", label: "العنوان", type: "text", default: "استكشف أعمالنا" },
          {
            key: "works.text",
            label: "النص",
            type: "textarea",
            default:
              "ألق نظرة على مشاريعنا السابقة والحلول البرمجية التي قمنا بتنفيذها لعملائنا في مختلف القطاعات.",
          },
          { key: "works.button", label: "الزرار", type: "text", default: "شاهد سابقة الأعمال" },
        ],
      },
      {
        title: "الدعوة للتواصل",
        fields: [
          { key: "cta.title", label: "العنوان", type: "text", default: "هل لديك فكرة مشروع برمجي؟" },
          {
            key: "cta.subtitle",
            label: "النص",
            type: "text",
            default: "فريق Digital AD جاهز لتحويل فكرتك إلى واقع تقني بأعلى معايير الجودة.",
          },
          { key: "cta.button", label: "الزرار", type: "text", default: "تواصل معنا الآن" },
        ],
      },
    ],
  },

  // ===================== خدماتنا =====================
  {
    key: "services",
    title: "صفحة خدماتنا",
    path: "/services",
    icon: "spark",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "خدماتنا" },
          { key: "hero.title", label: "العنوان", type: "text", default: "خدماتنا الإعلانية" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default: "حلول متكاملة لتعزيز تواجدك الرقمي وتحقيق أهدافك التسويقية",
          },
        ],
      },
    ],
  },

  // ===================== أعمالنا =====================
  {
    key: "portfolio",
    title: "صفحة أعمالنا",
    path: "/portfolio",
    icon: "image",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "أعمالنا" },
          { key: "hero.title", label: "العنوان", type: "text", default: "معرض أعمالنا" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default: "نماذج من أعمالنا المتميزة التي حققت نتائج استثنائية لعملائنا",
          },
        ],
      },
    ],
  },

  // ===================== المتجر =====================
  {
    key: "store",
    title: "صفحة المتجر",
    path: "/store",
    icon: "box",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "🛍️ المتجر" },
          { key: "hero.title", label: "العنوان", type: "text", default: "منتجات وحلول جاهزة" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default:
              "اكتشف مجموعة واسعة من المنتجات المطبوعة والدعائية وحلول المعارض لعلامتك التجارية",
          },
        ],
      },
    ],
  },

  // ===================== من نحن =====================
  {
    key: "about",
    title: "صفحة من نحن",
    path: "/about",
    icon: "users",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "من نحن" },
          { key: "hero.title", label: "العنوان", type: "text", default: "وكالة الإعلان الرقمي" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default: "قصتنا، رؤيتنا، وفريقنا المتميز الذي يعمل لتحقيق نجاحك",
          },
        ],
      },
    ],
  },

  // ===================== تواصل معنا =====================
  {
    key: "contact",
    title: "صفحة تواصل معنا",
    path: "/contact",
    icon: "mail",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "تواصل معنا" },
          { key: "hero.title", label: "العنوان", type: "text", default: "نحن هنا لمساعدتك" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default: "تواصل معنا الآن وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن",
          },
        ],
      },
    ],
  },

  // ===================== اطلب خدمة =====================
  {
    key: "request",
    title: "صفحة طلب خدمة",
    path: "/request",
    icon: "file",
    sections: [
      {
        title: "الواجهة الأولى",
        fields: [
          { key: "hero.badge", label: "الشارة", type: "text", default: "طلب خدمة" },
          { key: "hero.title", label: "العنوان", type: "text", default: "اطلب خدمتك الآن" },
          {
            key: "hero.subtitle",
            label: "النص تحت العنوان",
            type: "textarea",
            default: "أخبرنا عن مشروعك وسنقدم لك أفضل حل يناسب احتياجاتك وميزانيتك",
          },
        ],
      },
      {
        title: "مميزات الطلب (تحت الفورم)",
        fields: [
          { key: "perk1.title", label: "الميزة الأولى — العنوان", type: "text", default: "رد سريع" },
          { key: "perk1.desc", label: "الميزة الأولى — الوصف", type: "text", default: "نرد على طلبك خلال 24 ساعة" },
          { key: "perk2.title", label: "الميزة الثانية — العنوان", type: "text", default: "عرض سعر مجاني" },
          { key: "perk2.desc", label: "الميزة الثانية — الوصف", type: "text", default: "نقدم لك عرض سعر مفصّل مجانًا" },
          { key: "perk3.title", label: "الميزة الثالثة — العنوان", type: "text", default: "حل مخصص" },
          { key: "perk3.desc", label: "الميزة الثالثة — الوصف", type: "text", default: "حل مصمم خصيصًا لاحتياجاتك" },
        ],
      },
    ],
  },

  // ===================== الهيدر والفوتر =====================
  {
    key: "layout",
    title: "الهيدر والفوتر",
    path: "/",
    icon: "settings",
    sections: [
      {
        title: "الفوتر",
        fields: [
          {
            key: "footer.about",
            label: "نبذة الفوتر",
            type: "textarea",
            default:
              "وكالة إعلان رقمي متخصصة في تقديم حلول تسويقية مبتكرة وفعّالة تساعد الشركات على النمو وتحقيق أهدافها التجارية منذ 2017.",
          },
          { key: "footer.linksTitle", label: "عنوان عمود الروابط", type: "text", default: "روابط سريعة" },
          { key: "footer.contactTitle", label: "عنوان عمود التواصل", type: "text", default: "تواصل معنا" },
          {
            key: "footer.note",
            label: "السطر الأخير",
            type: "text",
            default: "تأسست عام 2017 | الرياض، المملكة العربية السعودية",
          },
        ],
      },
      {
        title: "أزرار الهيدر",
        fields: [
          { key: "header.cta", label: "زرار طلب خدمة", type: "text", default: "طلب خدمة" },
          { key: "header.login", label: "زرار الدخول", type: "text", default: "دخول" },
        ],
      },
    ],
  },
];

// ===================================================================
//  محركات البحث — بيتضاف تلقائيًا كأول قسم في كل صفحة
// ===================================================================
// العنوان والوصف اللي بيظهروا في نتايج جوجل ولما اللينك يتبعت على واتساب.
// بنحطهم هنا بدل ما نكرر نفس القسم ٨ مرات فوق.

const SEO_DEFAULTS = {
  home: {
    title: "Digital AD | وكالة الإعلان الرقمي في الرياض",
    description:
      "وكالة إعلان رقمي في الرياض متخصصة في الدعاية والإعلان، الطباعة، تجهيز المعارض، والهدايا الدعائية. خبرة منذ 2017 وأكثر من 500 مشروع ناجح.",
  },
  solutions: {
    title: "الحلول الرقمية | Digital AD",
    description:
      "حلول رقمية متكاملة: تصميم المواقع، إدارة السوشيال ميديا، الحملات الإعلانية، والهوية البصرية — من وكالة الإعلان الرقمي بالرياض.",
  },
  services: {
    title: "خدماتنا | دعاية وإعلان وطباعة في الرياض",
    description:
      "خدمات الدعاية والإعلان: طباعة رقمية وأوفست، لوحات إعلانية، تجهيز المعارض والمؤتمرات، هدايا دعائية، وتصميم الهوية البصرية.",
  },
  portfolio: {
    title: "أعمالنا | معرض مشاريع Digital AD",
    description:
      "شوف نماذج من مشاريعنا في الطباعة، تجهيز المعارض، الهوية البصرية، والحملات الإعلانية لعملاء في السعودية.",
  },
  store: {
    title: "المتجر | هدايا دعائية ومطبوعات",
    description:
      "اطلب مطبوعاتك وهداياك الدعائية أونلاين: كروت أعمال، رول أب، مظلات، أكواب، تيشيرتات وأكتر — بأسعار واضحة وتسليم سريع.",
  },
  about: {
    title: "من نحن | Digital AD وكالة الإعلان الرقمي",
    description:
      "وكالة الإعلان الرقمي — تأسست 2017 في الرياض. فريق متخصص في الدعاية والإعلان والطباعة وحلول التسويق المتكاملة.",
  },
  contact: {
    title: "تواصل معنا | Digital AD",
    description:
      "كلّمنا في أي وقت — الرياض، حي الدفاع. اتصل، راسلنا واتساب، أو ابعتلنا رسالة ونرد عليك في نفس اليوم.",
  },
  request: {
    title: "اطلب خدمة | عرض سعر مجاني",
    description:
      "احكيلنا عن مشروعك واستلم عرض سعر مفصّل مجانًا خلال 24 ساعة من فريق Digital AD.",
  },
};

for (const page of PAGE_SCHEMA) {
  const seo = SEO_DEFAULTS[page.key];
  if (!seo) continue;

  page.sections.unshift({
    title: "محركات البحث (SEO)",
    hint: "ده اللي بيظهر في نتايج جوجل ولما حد يبعت لينك الصفحة على واتساب أو تويتر.",
    fields: [
      {
        key: "seo.title",
        label: "عنوان الصفحة في جوجل",
        type: "text",
        default: seo.title,
        hint: "الأفضل يبدأ بالكلمة المهمة وينتهي باسم الشركة.",
        counter: { min: 40, max: 60 },
      },
      {
        key: "seo.description",
        label: "الوصف تحت العنوان",
        type: "textarea",
        default: seo.description,
        hint: "جملتين يوضّحوا الصفحة بتقدّم إيه ويخلّوا الناس تضغط.",
        counter: { min: 110, max: 160 },
      },
    ],
  });
}

/** بيرجّع الحقول كلها لصفحة معيّنة في شكل مسطّح */
export function fieldsFor(pageKey) {
  const page = PAGE_SCHEMA.find((p) => p.key === pageKey);
  if (!page) return [];
  return page.sections.flatMap((section) => section.fields);
}

export const PAGE_KEYS = PAGE_SCHEMA.map((p) => p.key);

/** نصوص SEO الافتراضية لكل صفحة — بيستخدمها الـ API العام */
export function seoDefaults() {
  return SEO_DEFAULTS;
}
