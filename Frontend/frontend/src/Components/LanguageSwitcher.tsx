import { useEffect, useState } from "react";
import "./language-switcher.css";

export type SiteLanguage = "en" | "ar";

const STORAGE_KEY = "andalusia-language";

const translations: Record<string, string> = {
  "Welcome to Andalusia Academy": "مرحبًا بكم في أكاديمية أندلسية",
  "Choose Your Portal:": "اختار البوابة:",
  "Choose Your Portal": "اختار البوابة",
  "Student": "الطالب",
  "Instructor": "المحاضر",
  "Coordinator": "المنسق",
  "Admin": "المسؤول",
  "Programs": "البرامج",
  "Offline Courses": "الدورات الحضورية",
  "Career Paths": "المسارات المهنية",
  "For Business": "للشركات",
  "Accreditations": "الاعتمادات",
  "Campus Portals": "بوابات الحرم الأكاديمي",
  "Sign In / Portal": "تسجيل الدخول / البوابة",
  "Apply Now": "قدّم الآن",
  "All Tracks": "كل المسارات",
  "Executive AI": "الذكاء الاصطناعي التنفيذي",
  "FinTech": "التكنولوجيا المالية",
  "Product & Tech": "المنتجات والتكنولوجيا",
  "Offline Labs": "المعامل الحضورية",
  "Search offline cohorts, certifications, diplomas...": "ابحث عن المجموعات الحضورية والشهادات والدبلومات...",
  "Search cohorts, certifications...": "ابحث عن المجموعات والشهادات...",
  "Close menu": "إغلاق القائمة",
  "Open menu": "فتح القائمة",
  "Unified Portal": "البوابة الموحدة",
  "Home": "الرئيسية",
  "About Andalusia Academy": "عن أكاديمية أندلسية",
  "Academic Charter": "الميثاق الأكاديمي",
  "Academic Tracks": "المسارات الأكاديمية",
  "Accreditations": "الاعتمادات",
  "Create an account": "إنشاء حساب",
  "Create learner account": "إنشاء حساب متعلم",
  "First name": "الاسم الأول",
  "Last name": "اسم العائلة",
  "Full Name": "الاسم بالكامل",
  "Email": "البريد الإلكتروني",
  "Corporate Email": "البريد الإلكتروني للشركة",
  "Password": "كلمة المرور",
  "Confirm password": "تأكيد كلمة المرور",
  "Confirm new password": "تأكيد كلمة المرور الجديدة",
  "New password": "كلمة المرور الجديدة",
  "Mobile number": "رقم الهاتف المحمول",
  "Mobile / WhatsApp": "الهاتف / واتساب",
  "Learner sign in": "تسجيل دخول المتعلم",
  "Welcome back": "مرحبًا بعودتك",
  "Sign in": "تسجيل الدخول",
  "Sign in to continue": "سجّل الدخول للمتابعة",
  "Forgot password?": "هل نسيت كلمة المرور؟",
  "New learner?": "هل أنت متعلم جديد؟",
  "Go to login": "الانتقال لتسجيل الدخول",
  "Resend code": "إعادة إرسال الرمز",
  "Email verification code": "رمز تأكيد البريد الإلكتروني",
  "6-digit email code": "رمز البريد الإلكتروني المكوّن من 6 أرقام",
  ". Enter it below to verify your email.": ". أدخله أدناه لتأكيد بريدك الإلكتروني.",
  "We sent a 6-digit verification code to": "أرسلنا رمز تأكيد مكوّنًا من 6 أرقام إلى",
  "Email verified successfully. You can now sign in.": "تم تأكيد البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.",
  "Signed in successfully.": "تم تسجيل الدخول بنجاح.",
  "Back to password login": "العودة لتسجيل الدخول بكلمة المرور",
  "Sign in with email code": "تسجيل الدخول باستخدام رمز البريد الإلكتروني",
  "Loading...": "جارٍ التحميل...",
  "Loading featured courses…": "جارٍ تحميل الدورات المميزة…",
  "Career Paths": "المسارات المهنية",
  "Courses": "الدورات",
  "View Course": "عرض الدورة",
  "View Program": "عرض البرنامج",
  "View Program Details": "عرض تفاصيل البرنامج",
  "Explore Career Path": "استكشف المسار المهني",
  "All Tracks": "كل المسارات",
  "No Career Paths Found": "لم يتم العثور على مسارات مهنية",
  "Try resetting filters to show verified pathways.": "جرّب إعادة ضبط عوامل التصفية لعرض المسارات المتاحة.",
  "New cohorts will be announced soon.": "سيتم الإعلان عن المجموعات الجديدة قريبًا.",
  "Programs for this career path will be announced soon.": "سيتم الإعلان عن برامج هذا المسار المهني قريبًا.",
  "Back to Main Platform": "العودة إلى المنصة الرئيسية",
  "Unified Portal": "البوابة الموحدة",
  "Log out": "تسجيل الخروج",
  "Tuition": "الرسوم الدراسية",
  "Tuition & Finance": "الرسوم والشؤون المالية",
  "Privacy Notice": "إشعار الخصوصية",
  "Terms of Service": "شروط الخدمة",
  "Refund & Transfer Policy": "سياسة الاسترداد والتحويل",
  "Campus": "الحرم الأكاديمي",
  "Campus Address:": "عنوان الحرم الأكاديمي:",
  "Campus Open Hours:": "ساعات العمل:",
  "Response within 24 business hours": "الرد خلال 24 ساعة عمل",
  "Call Registrar ➔": "اتصل بمكتب التسجيل ➔",
  "Request Admission Interview": "طلب مقابلة قبول",
  "Apply for Executive Path Interview": "التقديم لمقابلة المسار التنفيذي",
  "Discover the Platform": "اكتشف المنصة",
  "Architected For Career Acceleration": "مصممة لتسريع المسيرة المهنية",
  "Connected Academic Pathways": "مسارات أكاديمية مترابطة",
  "Expert Industry Mentors": "مرشدون خبراء من القطاع",
  "Learn from senior practitioners in tech and banking": "تعلّم من خبراء متمرسين في التكنولوجيا والخدمات المصرفية",
  "Fast-Track Program Finder": "البحث السريع عن البرامج",
  "Executive Career Paths & Leadership Roadmaps": "المسارات المهنية التنفيذية وخرائط القيادة",
  "What Your Organization Gets": "ما الذي ستحصل عليه مؤسستك",
  "Explore Career Path": "استكشف المسار المهني",
  "Programs mapped to CPD and Pearson standards": "برامج متوافقة مع معايير CPD وPearson",
  "Dual certification with international accreditation bodies": "شهادتان مع جهات اعتماد دولية",
  "Hands-On Offline Labs": "معامل تطبيقية حضورية",
  "Offline Cohorts": "مجموعات حضورية",
  "Offline Labs": "المعامل الحضورية",
  "Full Stack Engineering": "هندسة البرمجيات الشاملة",
  "Full-Stack Engineering": "هندسة البرمجيات الشاملة",
  "Generative AI Engineering": "هندسة الذكاء الاصطناعي التوليدي",
  "Executive AI & ML": "الذكاء الاصطناعي التنفيذي وتعلّم الآلة",
  "FinTech & Open Banking": "التكنولوجيا المالية والخدمات المصرفية المفتوحة",
  "Security Architecture": "هندسة الأمن السيبراني",
  "Product Strategy": "استراتيجية المنتجات",
};

const originalTextNodes = new WeakMap<Text, string>();

function translateText(value: string, language: SiteLanguage): string {
  if (language === "en") return value;
  const trimmed = value.trim();
  const translated = translations[trimmed];
  if (!translated) return value;
  return value.replace(trimmed, translated);
}

function applyLanguage(language: SiteLanguage) {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("site-language-ar", language === "ar");

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, textarea, input, select, option[data-no-translate], [data-no-translate], .language-switcher")) continue;
    const textNode = node as Text;
    const original = textNode.textContent ?? "";
    const english = originalTextNodes.get(textNode);
    if (language === "en") {
      if (english !== undefined && original !== english) textNode.textContent = english;
    } else {
      if (english === undefined) originalTextNodes.set(textNode, original);
      const nextText = translateText(english ?? original, language);
      if (original !== nextText) textNode.textContent = nextText;
    }
  }

  const attributes = ["placeholder", "aria-label", "title"];
  document.querySelectorAll<HTMLElement>("input, button, a, select, option, img, [title], [aria-label]").forEach((element) => {
    attributes.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (current === null || element.closest(".language-switcher")) return;
      // Use a literal data-* attribute instead of dataset[key]. Dataset property
      // names cannot contain hyphens, and `english-aria-label` crashes React.
      const key = `data-english-${attribute}`;
      const stored = element.getAttribute(key);
      if (language === "en") {
        if (stored !== null) element.setAttribute(attribute, stored);
      } else {
        if (stored === null) element.setAttribute(key, current);
        element.setAttribute(attribute, translateText(stored ?? current, language));
      }
    });
  });
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<SiteLanguage>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    applyLanguage(language);
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* storage may be unavailable */ }

    const observer = new MutationObserver(() => applyLanguage(language));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const [menuOpen, setMenuOpen] = useState(false);

  const chooseLanguage = (nextLanguage: SiteLanguage) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
  };

  return (
    <div className="language-switcher" aria-label="Site language">
      <button
        type="button"
        className="language-switcher_trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Choose language"
        aria-expanded={menuOpen}
        title="Choose language"
      >
        <svg className="language-switcher_globe" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3.5 12h17M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9S9.8 5.4 12 3Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>{language === "en" ? "English" : "العربية"}</span>
        <svg className="language-switcher_chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {menuOpen && (
        <div className="language-switcher_menu" role="menu" aria-label="Select language">
          <button type="button" role="menuitem" className={language === "en" ? "is-selected" : ""} onClick={() => chooseLanguage("en")}>
            <span className="language-switcher_option-code">EN</span><span>English</span>{language === "en" && <span className="language-switcher_check">✓</span>}
          </button>
          <button type="button" role="menuitem" className={language === "ar" ? "is-selected" : ""} onClick={() => chooseLanguage("ar")}>
            <span className="language-switcher_option-code">ع</span><span>العربية</span>{language === "ar" && <span className="language-switcher_check">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
