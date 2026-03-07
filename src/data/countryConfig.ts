import { Building, Shield, Hospital, FileText, Landmark, Scale, Briefcase, Home, GraduationCap, Heart } from "lucide-react";

export type Country = 'ro' | 'uk';

export type ArticleTag = 'new' | 'important' | 'urgent';

export interface ScrapedArticle {
  id: string;
  date: string;
  title: string;
  originalContent: string;
  simplifiedContent: string;
  detailedPoints: string[];
  category: string;
  categoryEmoji: string;
  categoryName: string;
  url: string;
  tags: ArticleTag[];
  source: string;
  interests: string[];
}

export interface Website {
  id: string;
  name: string;
  emoji: string;
  description: string;
  icon: any;
  articleCount: number;
}

export interface CountryConfig {
  code: Country;
  flag: string;
  name: string;
  language: string;
  dateLocale: string;
  labels: {
    allSources: string;
    sources: string;
    sourcesDesc: string;
    searchTitle: string;
    searchPlaceholder: string;
    documentType: string;
    subject: string;
    allTypes: string;
    allSubjects: string;
    articles: string;
    articleCount: (n: number) => string;
    originalContent: string;
    simplified: string;
    keyPoints: string;
    viewOriginal: string;
    noArticles: string;
    noArticlesDesc: string;
    clearFilters: string;
    activeFilters: string;
    search: string;
    reset: string;
    lastUpdate: string;
    subtitle: string;
    interestsPlaceholder: string;
    interestsLabel: string;
    tagNew: string;
    tagImportant: string;
    tagUrgent: string;
  };
  websites: Omit<Website, 'articleCount'>[];
  documentTypes: { value: string; label: string }[];
  subjects: { value: string; label: string }[];
  interests: string[];
  articles: ScrapedArticle[];
}

export const romaniaConfig: CountryConfig = {
  code: 'ro',
  flag: '🇷🇴',
  name: 'România',
  language: 'ro',
  dateLocale: 'ro-RO',
  labels: {
    allSources: 'Toate Sursele',
    sources: 'Surse de Informații',
    sourcesDesc: 'Selectează sursa de informații pe care vrei să o vezi',
    searchTitle: 'Căutare și Filtrare',
    searchPlaceholder: 'Căutați după cuvinte-cheie...',
    documentType: 'Tip Document',
    subject: 'Subiect',
    allTypes: 'Toate tipurile',
    allSubjects: 'Toate subiectele',
    articles: 'Articole',
    articleCount: (n) => `${n} articole`,
    originalContent: 'Conținut Original:',
    simplified: 'Gata de Citit:',
    keyPoints: 'Puncte Importante:',
    viewOriginal: 'Vezi Articolul Original',
    noArticles: 'Nu sunt articole disponibile',
    noArticlesDesc: 'Nu au fost găsite articole pentru criteriile selectate. Încercați să modificați filtrele.',
    clearFilters: 'Resetează Filtrele',
    activeFilters: 'Filtre active:',
    search: 'Căutare',
    reset: 'Resetează',
    lastUpdate: 'Ultima actualizare',
    subtitle: 'Monitorizez zilnic site-urile guvernamentale pentru articole noi și le transform în povești ușor de înțeles!',
    interestsPlaceholder: 'ex: informații pentru chiriași, ajutor șomeri...',
    interestsLabel: 'Ce te interesează?',
    tagNew: 'NOU',
    tagImportant: 'IMPORTANT',
    tagUrgent: 'URGENT',
  },
  websites: [
    { id: 'all', name: 'Toate Sursele', emoji: '📋', description: 'Toate articolele din toate sursele', icon: FileText },
    { id: 'gov', name: 'Guvernul României', emoji: '🏛️', description: 'Hotărâri și decizii guvernamentale', icon: Building },
    { id: 'mai', name: 'Min. Afacerilor Interne', emoji: '🛡️', description: 'Comunicate despre securitate și ordine publică', icon: Shield },
    { id: 'ms', name: 'Min. Sănătății', emoji: '🏥', description: 'Informații despre sănătate publică', icon: Hospital },
  ],
  documentTypes: [
    { value: "all", label: "Toate tipurile" },
    { value: "hotarare", label: "Hotărâri" },
    { value: "ordonanta", label: "Ordonanțe" },
    { value: "ordin", label: "Ordine" },
    { value: "informare", label: "Informări" },
    { value: "comunicat", label: "Comunicate" },
  ],
  subjects: [
    { value: "all", label: "Toate subiectele" },
    { value: "sanatate", label: "Sănătate" },
    { value: "educatie", label: "Educație" },
    { value: "transport", label: "Transport" },
    { value: "infrastructura", label: "Infrastructură" },
    { value: "economie", label: "Economie" },
    { value: "mediu", label: "Mediu" },
    { value: "securitate", label: "Securitate" },
    { value: "administratie", label: "Administrație" },
  ],
  interests: ['informații pentru chiriași', 'ajutor șomeri', 'pensii', 'impozite', 'alocații copii', 'sănătate', 'educație'],
  articles: [
    {
      id: "sed_05_Iun",
      date: "5 iunie 2025",
      title: "Informație de presă privind actele normative adoptate",
      originalContent: "Guvernul României a adoptat în ședința din 5 iunie 2025 mai multe acte normative importante pentru dezvoltarea economică și socială a țării. Au fost aprobate măsuri pentru sprijinirea agriculturii, bugetul pentru infrastructură și noi reglementări pentru protecția mediului.",
      simplifiedContent: "Astăzi, echipa care conduce țara noastră s-a întâlnit și a hotărât lucruri foarte importante! Au făcut reguli noi care ne vor ajuta pe toți să trăim mai bine. Au gândit cum să ajute fermierii, să facă drumuri mai frumoase și să păstreze natura curată! 🚜💰🌱",
      detailedPoints: ["Au hotărât să construiască un drum nou în jurul orașului Botoșani ca să nu mai fie aglomerat centrul! 🛣️💰", "Au planuit să construiască o casă nouă pentru pompierii care ne salvează când avem probleme! 🚒👨‍🚒", "Au decis să dea mai mulți bani fermierilor ca să poată crește legume și fructe mai frumoase! 🚜🥕"],
      category: "infrastructure",
      categoryEmoji: "🛣️",
      categoryName: "Infrastructură",
      url: "https://gov.ro/ro/guvernul/sedinte-guvern/informatie-de-presa-privind-actele-normative-adoptate-in-cadrul-edintei-guvernului-romaniei-din-5-iunie-2025",
      tags: ['new'],
      source: "gov",
      interests: ['infrastructură', 'agricultură'],
    },
    {
      id: "mai_05_Iun",
      date: "5 iunie 2025",
      title: "Participarea premierului interimar la emisiunea Ediție Specială",
      originalContent: "Premierul interimar Cătălin Predoiu a participat la emisiunea Ediție Specială de la Antena 3 CNN, unde a discutat despre măsurile de securitate și planurile ministerului pentru următoarea perioadă.",
      simplifiedContent: "Premierul nostru s-a dus la televizor să vorbească cu oamenii despre cum ne protejează și ce planuri are ca să fim toți în siguranță! A explicat cum lucrează cu poliția și pompierii pentru noi! 🛡️📺",
      detailedPoints: ["A vorbit despre cum poliția ne protejează în fiecare zi! 👮‍♂️🚔", "A explicat cum pompierii se pregătesc să ne salveze când avem probleme! 🚒👨‍🚒"],
      category: "defense",
      categoryEmoji: "🛡️",
      categoryName: "Apărare și Securitate",
      url: "https://www.mai.gov.ro/participarea-premierului-interimar-catalin-predoiu-la-emisiunea-editie-speciala-antena-3-cnn/",
      tags: ['new', 'important'],
      source: "mai",
      interests: ['securitate'],
    },
    {
      id: "ms_04_Iun",
      date: "4 iunie 2025",
      title: "Noi măsuri pentru îmbunătățirea serviciilor medicale",
      originalContent: "Ministerul Sănătății anunță implementarea unor noi măsuri pentru îmbunătățirea calității serviciilor medicale în spitalele din România, inclusiv modernizarea echipamentelor și pregătirea personalului medical.",
      simplifiedContent: "Doctorii vor avea aparate noi și mai bune ca să ne poată ajuta mai repede când suntem bolnavi! Vor învăța lucruri noi ca să știe să ne îngrijească și mai bine! 🏥👩‍⚕️",
      detailedPoints: ["Vor cumpăra aparate noi pentru spitale ca să ne vindece mai repede! 🏥⚡", "Doctorii vor învăța să folosească tehnologii noi! 👩‍⚕️💻"],
      category: "health",
      categoryEmoji: "🏥",
      categoryName: "Sănătate",
      url: "https://www.ms.ro/ro/informatii-de-interes-public/noutati/masuri-servicii-medicale",
      tags: ['urgent'],
      source: "ms",
      interests: ['sănătate'],
    },
    {
      id: "gov_03_Iun",
      date: "3 iunie 2025",
      title: "Hotărâre privind bugetul pentru educație",
      originalContent: "Guvernul a aprobat suplimentarea bugetului pentru educație cu 50 milioane lei pentru modernizarea școlilor din mediul rural.",
      simplifiedContent: "Echipa care conduce țara a hotărât să dea mai mulți bani pentru școli! Vor face școlile din sate mai frumoase și mai moderne! 🎓💰",
      detailedPoints: ["Vor repara și moderniza școlile din sate! 🏫✨", "Vor cumpăra calculatoare noi pentru copii! 💻📚"],
      category: "education",
      categoryEmoji: "🎓",
      categoryName: "Educație",
      url: "https://gov.ro/ro/guvernul/sedinte-guvern/hotarare-buget-educatie",
      tags: ['important'],
      source: "gov",
      interests: ['educație'],
    },
  ],
};

export const ukConfig: CountryConfig = {
  code: 'uk',
  flag: '🇬🇧',
  name: 'United Kingdom',
  language: 'en',
  dateLocale: 'en-GB',
  labels: {
    allSources: 'All Sources',
    sources: 'Information Sources',
    sourcesDesc: 'Select the source you want to browse',
    searchTitle: 'Search & Filter',
    searchPlaceholder: 'Search by keywords...',
    documentType: 'Document Type',
    subject: 'Subject',
    allTypes: 'All types',
    allSubjects: 'All subjects',
    articles: 'Articles',
    articleCount: (n) => `${n} articles`,
    originalContent: 'Original Content:',
    simplified: 'Easy Read:',
    keyPoints: 'Key Points:',
    viewOriginal: 'View Original Article',
    noArticles: 'No articles available',
    noArticlesDesc: 'No articles found for the selected criteria. Try adjusting your filters.',
    clearFilters: 'Clear Filters',
    activeFilters: 'Active filters:',
    search: 'Search',
    reset: 'Reset',
    lastUpdate: 'Last updated',
    subtitle: 'Daily monitoring of government websites, simplified into easy-to-understand summaries!',
    interestsPlaceholder: 'e.g. info for landlords, benefits for unemployed...',
    interestsLabel: 'What are you interested in?',
    tagNew: 'NEW',
    tagImportant: 'IMPORTANT',
    tagUrgent: 'URGENT',
  },
  websites: [
    { id: 'all', name: 'All Sources', emoji: '📋', description: 'All articles from all sources', icon: FileText },
    { id: 'govuk', name: 'GOV.UK', emoji: '🏛️', description: 'UK Government policies and announcements', icon: Landmark },
    { id: 'hmrc', name: 'HMRC', emoji: '💷', description: 'Tax, benefits and customs', icon: Briefcase },
    { id: 'nhs', name: 'NHS', emoji: '🏥', description: 'Health guidance and updates', icon: Heart },
    { id: 'dwp', name: 'DWP', emoji: '🤝', description: 'Work, pensions and benefits', icon: Home },
    { id: 'ofsted', name: 'Ofsted', emoji: '🎓', description: 'Education and childcare standards', icon: GraduationCap },
  ],
  documentTypes: [
    { value: "all", label: "All types" },
    { value: "policy", label: "Policy Papers" },
    { value: "guidance", label: "Guidance" },
    { value: "legislation", label: "Legislation" },
    { value: "press_release", label: "Press Releases" },
    { value: "consultation", label: "Consultations" },
    { value: "notice", label: "Notices" },
  ],
  subjects: [
    { value: "all", label: "All subjects" },
    { value: "housing", label: "Housing" },
    { value: "benefits", label: "Benefits" },
    { value: "tax", label: "Tax" },
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "employment", label: "Employment" },
    { value: "immigration", label: "Immigration" },
    { value: "transport", label: "Transport" },
    { value: "environment", label: "Environment" },
  ],
  interests: ['info for landlords', 'benefits for unemployed', 'universal credit', 'council tax', 'childcare', 'NHS services', 'visa & immigration'],
  articles: [
    {
      id: "govuk_05_jun",
      date: "5 June 2025",
      title: "New Housing Standards for Private Landlords",
      originalContent: "The Department for Levelling Up, Housing and Communities has announced new minimum standards for privately rented homes. From September 2025, all rental properties must meet enhanced energy efficiency ratings and pass updated safety inspections. Landlords who fail to comply may face fines of up to £30,000.",
      simplifiedContent: "The government has made new rules for people who rent out homes! Houses must be warmer and safer. If landlords don't follow the rules, they could get a big fine! 🏠✅",
      detailedPoints: [
        "All rental homes must have an energy rating of C or above by September 2025! 🔋🏠",
        "New safety checks will include electrical wiring, fire alarms, and damp assessments! 🔌🔥",
        "Landlords who don't comply can be fined up to £30,000! 💷⚠️",
      ],
      category: "housing",
      categoryEmoji: "🏠",
      categoryName: "Housing",
      url: "https://www.gov.uk/government/news/new-housing-standards",
      tags: ['new', 'important'],
      source: "govuk",
      interests: ['info for landlords', 'housing'],
    },
    {
      id: "hmrc_05_jun",
      date: "5 June 2025",
      title: "Changes to Self-Assessment Tax Returns for 2025-26",
      originalContent: "HMRC has updated the self-assessment process for the 2025-26 tax year. The deadline for online submissions remains 31 January 2027, but new digital verification steps have been introduced. Taxpayers earning over £50,000 must now use Making Tax Digital compatible software.",
      simplifiedContent: "The tax people (HMRC) have changed how you do your tax returns! If you earn over £50,000, you'll need special software. Don't worry, the deadline is still January 2027! 💻📊",
      detailedPoints: [
        "New digital verification steps to make tax returns more secure! 🔐💻",
        "People earning over £50,000 must use special software! 📱💷",
        "The deadline for online returns is still 31 January 2027! 📅✅",
      ],
      category: "tax",
      categoryEmoji: "💷",
      categoryName: "Tax",
      url: "https://www.gov.uk/self-assessment-tax-returns",
      tags: ['new'],
      source: "hmrc",
      interests: ['tax', 'self-employment'],
    },
    {
      id: "nhs_04_jun",
      date: "4 June 2025",
      title: "NHS Expands Mental Health Support Services",
      originalContent: "NHS England has announced a major expansion of mental health support services, including 500 new community mental health centres and a 24/7 digital support platform. The programme will create 8,000 new roles for mental health professionals across England.",
      simplifiedContent: "The NHS is making it easier to get help if you're feeling down or anxious! They're opening 500 new centres and hiring thousands of people to help. There'll also be an app you can use anytime! 🧠💚",
      detailedPoints: [
        "500 new community mental health centres opening across England! 🏥🧠",
        "A new 24/7 digital platform for mental health support! 📱💚",
        "8,000 new jobs for mental health professionals! 👩‍⚕️👨‍⚕️",
      ],
      category: "health",
      categoryEmoji: "🏥",
      categoryName: "Health",
      url: "https://www.england.nhs.uk/mental-health/",
      tags: ['important'],
      source: "nhs",
      interests: ['NHS services', 'health'],
    },
    {
      id: "dwp_03_jun",
      date: "3 June 2025",
      title: "Universal Credit: New Work Allowance Thresholds",
      originalContent: "The Department for Work and Pensions has raised the work allowance thresholds for Universal Credit claimants. Single parents can now earn up to £404 per month before their UC is affected, while other eligible claimants can earn up to £379. The changes aim to support people transitioning back into work.",
      simplifiedContent: "Great news for people on Universal Credit! You can now earn more money from work before it affects your benefits. This means you keep more of what you earn! 💰🎉",
      detailedPoints: [
        "Single parents can earn up to £404/month before UC is reduced! 👨‍👧💷",
        "Other eligible people can earn up to £379/month! 💼✅",
        "These changes help people keep more money when they start working! 🎉💰",
      ],
      category: "benefits",
      categoryEmoji: "🤝",
      categoryName: "Benefits",
      url: "https://www.gov.uk/universal-credit/work-allowance",
      tags: ['urgent', 'important'],
      source: "dwp",
      interests: ['benefits for unemployed', 'universal credit'],
    },
    {
      id: "ofsted_02_jun",
      date: "2 June 2025",
      title: "Updated Childcare Provider Standards",
      originalContent: "Ofsted has published updated inspection standards for childcare providers across England. The new framework emphasises child safety, staff qualifications, and inclusive practices for children with special educational needs and disabilities (SEND).",
      simplifiedContent: "The people who check nurseries and childminders have updated their rules! They're making sure all children, including those who need extra help, are safe and well looked after! 👶✨",
      detailedPoints: [
        "Stronger safety rules for all nurseries and childminders! 🛡️👶",
        "Staff must have better qualifications! 📚👩‍🏫",
        "Better support for children with special needs! 🌟🤝",
      ],
      category: "education",
      categoryEmoji: "🎓",
      categoryName: "Education",
      url: "https://www.gov.uk/government/organisations/ofsted",
      tags: ['new'],
      source: "ofsted",
      interests: ['childcare', 'education'],
    },
  ],
};

export const getCountryConfig = (country: Country): CountryConfig => {
  return country === 'ro' ? romaniaConfig : ukConfig;
};
