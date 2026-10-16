import { Language, NavTab } from '@/types';

export interface Translations {
  header: {
    subtitle: string;
    greeting: string;
    greetingSub: string;
    searchPlaceholder: string;
    loginBtn: string;
    logoutBtn: string;
    ultraVIP: string;
    premium: string;
    freeTokens: string;
  };
  navbar: {
    welcome: string;
    student: string;
    tools: string;
    login: string;
    loginRequired: string;
    darslar: string;
    darslarFull: string;
    darsxona: string;
    darsxonaFull: string;
    groups: string;
    groupsFull: string;
    contacts: string;
    contactsFull: string;
    helperTools: string;
    helperToolsDesc: string;
    slides: string;
    slidesDesc: string;
    mustaqil: string;
    mustaqilDesc: string;
    research: string;
    researchDesc: string;
    history: string;
    historyDesc: string;
    settings: string;
    settingsFull: string;
    editProfile: string;
    apiKeySettings: string;
    logout: string;
  };
  banner: {
    getTabTitle: (tab: NavTab) => string;
    lockedBadge: (tabTitle: string) => string;
    heroTitlePre: string;
    heroTitlePost: string;
    heroDesc: (tabTitle: string) => string;
    btnRegister: string;
    btnTelegram: string;
    badgeFreeReg: string;
    badgeFreeLessons: string;
    featuresSubtitle: string;
    featuresTitle: string;
    featuresDesc: string;
    features: {
      title: string;
      badge: string;
      desc: string;
    }[];
    stepsTitle: string;
    stepsDesc: string;
    stepsBtn: string;
    steps: {
      step: string;
      title: string;
      desc: string;
    }[];
    calloutTitle: string;
    calloutDesc: string;
    calloutBtn: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  uz: {
    header: {
      subtitle: 'O‘zbekiston Talabalari Uchun Ta‘lim Platformasi',
      greeting: 'Assalomu alaykum',
      greetingSub: 'TalabaAI bilan bugungi darslar va topshiriqlaringiz tayyor',
      searchPlaceholder: 'Darslar, mavzular yoki kontaktlar...',
      loginBtn: 'Tizimga Kirish / Ro‘yxatdan O‘tish',
      logoutBtn: 'Akkountdan chiqish',
      ultraVIP: 'Ultra VIP (Cheksiz)',
      premium: 'Premium',
      freeTokens: 'bepul token',
    },
    navbar: {
      welcome: 'Xush kelibsiz',
      student: 'Talaba',
      tools: 'Dasturlar',
      login: 'Kirish',
      loginRequired: 'Kirish kerak',
      darslar: 'Darslar',
      darslarFull: 'Online Video Darsliklar',
      darsxona: 'Darsxona',
      darsxonaFull: 'Jonli Darsxona (Live Stream)',
      groups: 'Guruhlar',
      groupsFull: 'O‘quv Guruhlari & Muloqot',
      contacts: 'Kontaktlar',
      contactsFull: 'Kontaktlar Kitobi',
      helperTools: 'Yordamchi Dasturlar',
      helperToolsDesc: 'Slaydlar, Mustaqil ish, AI',
      slides: 'Gamma Slayd Generator',
      slidesDesc: 'AI orqali zamonaviy taqdimot va slaydlar',
      mustaqil: 'Mustaqil Ish & Word (.docx)',
      mustaqilDesc: 'Referat, kurs ishi va topshiriqlar',
      research: 'Smart Research AI',
      researchDesc: 'Ilmiy maqolalar va ma‘lumotlar tahlili',
      history: 'Mening Loyihalarim',
      historyDesc: 'Saqlangan slayd va hujjatlar',
      settings: 'Sozlamalar',
      settingsFull: 'Sozlamalar & Profil',
      editProfile: 'Profilni tahrirlash',
      apiKeySettings: 'API Kalit sozlamalari',
      logout: 'Akkountdan chiqish',
    },
    banner: {
      getTabTitle: (tab: NavTab) => {
        switch (tab) {
          case 'darslar': return 'Online Video Darsliklar';
          case 'darsxona': return 'Jonli Darsxona (Live Stream)';
          case 'groups':
          case 'messenger': return 'O‘quv Guruhlari & Muloqot';
          case 'contacts': return 'Kontaktlar Kitobi';
          default: return 'Ta‘lim Bo‘limi';
        }
      },
      lockedBadge: (tabTitle: string) => `${tabTitle} bo‘limi — Akkountga kirish talab etiladi`,
      heroTitlePre: 'Talaba',
      heroTitlePost: ' — O‘zbekiston Talabalari Uchun 1-Raqamli Ta‘lim Platformasi',
      heroDesc: (tabTitle: string) =>
        `Siz tanlagan «${tabTitle}» bo‘limidan foydalanish, guruhdoshlaringiz bilan yozishish va video darslarni tomosha qilish uchun shaxsiy hisobingizga kiring yoki 1 daqiqada bepul ro‘yxatdan o‘ting!`,
      btnRegister: '🚀 Bepul Ro‘yxatdan O‘tish / Kirish',
      btnTelegram: 'Telegram Bot Orqali Kirish',
      badgeFreeReg: '100% Bepul ro‘yxatdan o‘tish',
      badgeFreeLessons: '5 ta dars mutlaqo bepul',
      featuresSubtitle: 'Nimalarga ega bo‘lasiz?',
      featuresTitle: 'TalabaAI Platformasi Imkoniyatlari',
      featuresDesc: 'Ro‘yxatdan o‘tishingiz bilan quyidagi barcha imkoniyatlar siz uchun ochiladi:',
      features: [
        {
          title: 'Online Video Darsliklar',
          badge: '5 ta Bepul',
          desc: 'Oliy ta‘lim va kasbiy fanlar (Frontend, Python, Kiberxavfsizlik, IELTS). Har bir fanning 5 ta darsi mutlaqo bepul!',
        },
        {
          title: 'Jonli Darsxona (Live Stream)',
          badge: 'Jonli Efir',
          desc: 'Ustozlar va talabalar uchun real-vaqtda interaktiv video darslar, ekran va kamera ulashish imkoniyati.',
        },
        {
          title: 'Akademik Guruhlar va Chat',
          badge: 'Guruhlar',
          desc: 'O‘z akademik guruhingiz bilan xavfsiz chat, fayllar, konspektlar va topshiriqlarni tezkor almashish.',
        },
        {
          title: 'Kontaktlar Kitobi',
          badge: 'Shaxsiy Chat',
          desc: 'Guruhdoshlar va o‘qituvchilar bilan shaxsiy muloqot, telefon raqamlari va manzillar ma‘lumotlar bazasi.',
        },
        {
          title: 'Gamma Slayd Generator',
          badge: 'AI',
          desc: 'Har qanday mavzuda 1 daqiqada zamonaviy, rang-barang va vizual taqdimotlarni avtomatik yaratish.',
        },
        {
          title: 'Mustaqil Ish & Word (.docx)',
          badge: 'Word',
          desc: 'Oliy ta‘lim standartlari asosida referat, kurs ishi va mustaqil ishlarni to‘liq tayyorlab beruvchi AI.',
        },
      ],
      stepsTitle: 'Saytdan Qanday Ro‘yxatdan O‘tiladi?',
      stepsDesc: 'Atigi 4 ta oddiy qadam bilan 1 daqiqa ichida hisobingizni oching:',
      stepsBtn: 'Hozir Ro‘yxatdan O‘tish',
      steps: [
        {
          step: '1',
          title: 'Ro‘yxatdan o‘tish tugmasini bosing',
          desc: 'Saytning yuqori o‘ng burchagidagi «Kirish» yoki quyidagi «Bepul Ro‘yxatdan O‘tish» tugmasini bosing.',
        },
        {
          step: '2',
          title: 'Universitet va ma‘lumotlaringizni kiriting',
          desc: 'Universitetingizni tanlang, ism-familiyangiz, telefon raqamingiz, login va parolingizni belgilang.',
        },
        {
          step: '3',
          title: 'SMS yoki Telegram orqali tasdiqlang',
          desc: 'Telegram botimiz (@darsliklar_ai_bot) orqali yoki SMS tarzida yuborilgan tasdiqlash kodini yozing.',
        },
        {
          step: '4',
          title: 'Profilingizga kiring va boshlang!',
          desc: 'Profilingiz darhol faollashadi va video darslar, slaydlar hamda guruhlar siz uchun ochiladi.',
        },
      ],
      calloutTitle: 'Talabalik yillaringizni TalabaAI bilan osonlashtiring!',
      calloutDesc: 'Minglab talabalar darslarni o‘rganish, slaydlar va mustaqil ishlarni tayyorlash uchun har kuni ushbu platformadan foydalanmoqda.',
      calloutBtn: 'Kirish / Ro‘yxatdan O‘tish',
    },
  },

  kaa: {
    header: {
      subtitle: 'Qaraqalpaqstan Talabaları Ushın Bilimlendiriw Platforması',
      greeting: 'Ásalamu áleykum',
      greetingSub: 'TalabaAI menen búgingi sabaqlar hám tapsırmalarıńız tayar',
      searchPlaceholder: 'Sabaqlar, temalar yamasa kontaktlar...',
      loginBtn: 'Sistemaǵa Kiriw / Dizimnen Ótiw',
      logoutBtn: 'Akkaunttan shıǵıw',
      ultraVIP: 'Ultra VIP (Sheksiz)',
      premium: 'Premium',
      freeTokens: 'biypul token',
    },
    navbar: {
      welcome: 'Xosh keldińiz',
      student: 'Talaba',
      tools: 'Dástúrler',
      login: 'Kiriw',
      loginRequired: 'Kiriw kerek',
      darslar: 'Sabaqlar',
      darslarFull: 'Online Video Sabaqlıqlar',
      darsxona: 'Klassxana',
      darsxonaFull: 'Janlı Klassxana (Live Stream)',
      groups: 'Toparlar',
      groupsFull: 'Oqıw Toparları & Chat',
      contacts: 'Kontaktlar',
      contactsFull: 'Kontaktlar Kitabı',
      helperTools: 'Járdemshi Dástúrler',
      helperToolsDesc: 'Slaydlar, Ǵárezsiz jumıs, AI',
      slides: 'Gamma Slayd Generator',
      slidesDesc: 'AI arqalı zamanagóy prezentatsiyalar',
      mustaqil: 'Ǵárezsiz Jumıs & Word (.docx)',
      mustaqilDesc: 'Referat, kurs jumısı hám tapsırmalar',
      research: 'Smart Research AI',
      researchDesc: 'Ilimiy maqalalar hám maǵlıwmatlar analizi',
      history: 'Meniń Joybarlarım',
      historyDesc: 'Saqlanǵan slayd hám hújjetler',
      settings: 'Sazlawlar',
      settingsFull: 'Sazlawlar & Profil',
      editProfile: 'Profilni ózgertiw',
      apiKeySettings: 'API gilt sazlawları',
      logout: 'Akkaunttan shıǵıw',
    },
    banner: {
      getTabTitle: (tab: NavTab) => {
        switch (tab) {
          case 'darslar': return 'Online Video Sabaqlıqlar';
          case 'darsxona': return 'Janlı Klassxana (Live Stream)';
          case 'groups':
          case 'messenger': return 'Oqıw Toparları & Chat';
          case 'contacts': return 'Kontaktlar Kitabı';
          default: return 'Bilimlendiriw Bólimi';
        }
      },
      lockedBadge: (tabTitle: string) => `${tabTitle} bólimi — Akkauntqa kiriw talap etiledi`,
      heroTitlePre: 'Talaba',
      heroTitlePost: ' — Qaraqalpaqstan Talabaları Ushın 1-Sanlı Bilimlendiriw Platforması',
      heroDesc: (tabTitle: string) =>
        `Siz tańlaǵan «${tabTitle}» bóliminen paydalanıw, toparlaslarıńız benen jazısıw hám video sabaqlardı kóriw ushın jeke akkauntuńızǵa kiriń yamasa 1 minut ishinde biypul dizimnen ótiń!`,
      btnRegister: '🚀 Biypul Dizimnen Ótiw / Kiriw',
      btnTelegram: 'Telegram Bot Arqalı Kiriw',
      badgeFreeReg: '100% Biypul dizimnen ótiw',
      badgeFreeLessons: '5 sabaq pútkilley biypul',
      featuresSubtitle: 'Nelerge iye bolasız?',
      featuresTitle: 'TalabaAI Platforması Imkaniyatları',
      featuresDesc: 'Dizimnen ótiwińiz benen tómendegi barlıq imkaniyatlar siz ushın ashıladı:',
      features: [
        {
          title: 'Online Video Sabaqlıqlar',
          badge: '5 Sabaq Biypul',
          desc: 'Joqarı bilimlendiriw hám kásiplik pánler (Frontend, Python, Kiberqáwipsizlik, IELTS). Hár bir pánniń 5 sabaǵı pútkilley biypul!',
        },
        {
          title: 'Janlı Klassxana (Live Stream)',
          badge: 'Janlı Efir',
          desc: 'Oqıtıwshılar hám talabalar ushın real waqıtta interaktiv video darslar, ekran hám kamera bólisiw imkaniyatı.',
        },
        {
          title: 'Akademiyalıq Toparlar hám Chat',
          badge: 'Toparlar',
          desc: 'Óz toparıńız benen qáwipsiz chat, fayllar, konspektler hám tapsırmalardı jedel almasıw.',
        },
        {
          title: 'Kontaktlar Kitabı',
          badge: 'Jeke Chat',
          desc: 'Toparlaslar hám oqıtıwshılar menen jeke múnásibet, telefon nomerleri hám maǵlıwmatlar bazası.',
        },
        {
          title: 'Gamma Slayd Generator',
          badge: 'AI',
          desc: 'Qálegen temada 1 minut ishinde zamanagóy, reńli hám vizual prezentatsiyalardı avtomat jaratıw.',
        },
        {
          title: 'Ǵárezsiz Jumıs & Word (.docx)',
          badge: 'Word',
          desc: 'Joqarı oqıw orınları standartları tiykarında referat, kurs jumısı hám ǵárezsiz jumıslardı tolıq tayarlawshı AI.',
        },
      ],
      stepsTitle: 'Sayttan Qalay Dizimnen Ótiledi?',
      stepsDesc: 'Bar-joǵı 4 ápiwayı qádem menen 1 minut ishinde akkauntuńızdı ashıń:',
      stepsBtn: 'Házir Dizimnen Ótiw',
      steps: [
        {
          step: '1',
          title: 'Dizimnen ótiw túymesin basıń',
          desc: 'Sayttıń joqarı oń múyeshindegi «Kiriw» yamasa tómendegi «Biypul Dizimnen Ótiw» túymesin basıń.',
        },
        {
          step: '2',
          title: 'Universitet hám maǵlıwmatlarıńızdı kirtiń',
          desc: 'Universitetińizdi tańlań, atı-familiyańız, telefon nomerińiz, login hám parolińizdı belgileń.',
        },
        {
          step: '3',
          title: 'SMS yamasa Telegram arqalı tastıyıqlań',
          desc: 'Telegram botımız (@darsliklar_ai_bot) yamasa SMS arqalı jiberilgen tastıyıqlaw kodın jazıń.',
        },
        {
          step: '4',
          title: 'Profilińizge kiriń hám baslań!',
          desc: 'Profilińiz dárhal iske túsedi hám video sabaqlar, slaydlar hám toparlar siz ushın ashıladı.',
        },
      ],
      calloutTitle: 'Talabalıq jıllarıńızdı TalabaAI menen ańsatlastırıń!',
      calloutDesc: 'Mıńlaǵan talabalar sabaqlardı úyreniw, slaydlar hám ǵárezsiz jumıslardı tayarlaw ushın hár kúni usı platformadan paydalanbaqta.',
      calloutBtn: 'Kiriw / Dizimnen Ótiw',
    },
  },

  kk: {
    header: {
      subtitle: 'Студенттерге арналған білім беру платформасы',
      greeting: 'Ассалаумағалейкум',
      greetingSub: 'TalabaAI арқылы бүгінгі сабақтарыңыз бен тапсырмаларыңыз дайын',
      searchPlaceholder: 'Сабақтар, тақырыптар немесе контактілер...',
      loginBtn: 'Жүйеге кіру / Тіркелу',
      logoutBtn: 'Аккаунттан шығу',
      ultraVIP: 'Ultra VIP (Шексіз)',
      premium: 'Премиум',
      freeTokens: 'тегін токен',
    },
    navbar: {
      welcome: 'Қош келдіңіз',
      student: 'Студент',
      tools: 'Бағдарламалар',
      login: 'Кіру',
      loginRequired: 'Кіру қажет',
      darslar: 'Сабақтар',
      darslarFull: 'Онлайн бейне сабақтар',
      darsxona: 'Дәрісхана',
      darsxonaFull: 'Тікелей дәрісхана (Live Stream)',
      groups: 'Топтар',
      groupsFull: 'Оқу топтары және чат',
      contacts: 'Контактілер',
      contactsFull: 'Байланыстар кітабы',
      helperTools: 'Көмекші құралдар',
      helperToolsDesc: 'Слайдтар, Өзіндік жұмыс, ИИ',
      slides: 'Gamma Слайд генераторы',
      slidesDesc: 'ИИ арқылы заманауи презентациялар жасау',
      mustaqil: 'Өзіндік жұмыс және Word (.docx)',
      mustaqilDesc: 'Реферат, курс жұмысы және тапсырмалар',
      research: 'Smart Research AI',
      researchDesc: 'Ғылыми мақалалар мен деректерді талдау',
      history: 'Менің жобаларым',
      historyDesc: 'Сақталған слайдтар мен құжаттар',
      settings: 'Баптаулар',
      settingsFull: 'Баптаулар және профиль',
      editProfile: 'Профильді өңдеу',
      apiKeySettings: 'API кілт баптаулары',
      logout: 'Аккаунттан шығу',
    },
    banner: {
      getTabTitle: (tab: NavTab) => {
        switch (tab) {
          case 'darslar': return 'Онлайн бейне сабақтар';
          case 'darsxona': return 'Тікелей дәрісхана (Live Stream)';
          case 'groups':
          case 'messenger': return 'Оқу топтары және чат';
          case 'contacts': return 'Байланыстар кітабы';
          default: return 'Білім бөлімі';
        }
      },
      lockedBadge: (tabTitle: string) => `«${tabTitle}» бөлімі — Жүйеге кіру қажет`,
      heroTitlePre: 'Talaba',
      heroTitlePost: ' — Өзбекстан Студенттеріне Арналған 1-Нөмірлі Білім Платформасы',
      heroDesc: (tabTitle: string) =>
        `Сіз таңдаған «${tabTitle}» бөлімін пайдалану, курстастарыңызбен хат алмасу және бейне сабақтарды көру үшін жеке есептік жазбаңызға кіріңіз немесе 1 минутта тегін тіркеліңіз!`,
      btnRegister: '🚀 Тегін Тіркелу / Кіру',
      btnTelegram: 'Telegram Бот арқылы кіру',
      badgeFreeReg: '100% Тегін тіркелу',
      badgeFreeLessons: '5 сабақ мүлдем тегін',
      featuresSubtitle: 'Сіз не аласыз?',
      featuresTitle: 'TalabaAI Платформасының Мүмкіндіктері',
      featuresDesc: 'Тіркелген бойда сізге келесі барлық мүмкіндіктер ашылады:',
      features: [
        {
          title: 'Онлайн бейне сабақтар',
          badge: '5 Сабақ Тегін',
          desc: 'Жоғары білім және кәсіби пәндер (Frontend, Python, Киберқауіпсіздік, IELTS). Әр пәннің 5 сабағы мүлдем тегін!',
        },
        {
          title: 'Тікелей дәрісхана (Live Stream)',
          badge: 'Тікелей эфир',
          desc: 'Оқытушылар мен студенттерге арналған интерактивті сабақтар, экран мен камераны бөлісу мүмкіндігі.',
        },
        {
          title: 'Академиялық топтар мен чат',
          badge: 'Топтар',
          desc: 'Өз тобыңызбен қауіпсіз чат, файлдар, конспектілер мен тапсырмаларды жылдам алмасу.',
        },
        {
          title: 'Байланыстар кітабы',
          badge: 'Жеке чат',
          desc: 'Курстастар және оқытушылармен жеке байланыс, телефон нөмірлері мен деректер қоры.',
        },
        {
          title: 'Gamma Слайд генераторы',
          badge: 'AI',
          desc: 'Кез келген тақырыпта 1 минут ішінде заманауи және көрнекі презентацияларды автоматты түрде жасау.',
        },
        {
          title: 'Өзіндік жұмыс және Word (.docx)',
          badge: 'Word',
          desc: 'Жоғары оқу стандарты бойынша реферат, курс жұмысы мен өзіндік жұмыстарды дайындап беретін ИИ.',
        },
      ],
      stepsTitle: 'Сайтқа Қалай Тіркелуге Болады?',
      stepsDesc: 'Бар болғаны 4 оңай қадаммен 1 минут ішінде есептік жазбаңызды ашыңыз:',
      stepsBtn: 'Қазір Тіркелу',
      steps: [
        {
          step: '1',
          title: 'Тіркелу батырмасын басыңыз',
          desc: 'Сайттың жоғарғы оң жағындағы «Кіру» немесе төмендегі «Тегін Тіркелу» түймесін басыңыз.',
        },
        {
          step: '2',
          title: 'Университет пен мәліметтеріңізді енгізіңіз',
          desc: 'Университетіңізді таңдап, аты-жөніңізді, телефон нөміріңізді, логин мен құпиясөзіңізді енгізіңіз.',
        },
        {
          step: '3',
          title: 'SMS немесе Telegram арқылы растаңыз',
          desc: 'Telegram боты (@darsliklar_ai_bot) немесе SMS арқылы келген 6 таңбалы растау кодын енгізіңіз.',
        },
        {
          step: '4',
          title: 'Профильге кіріп, бастаңыз!',
          desc: 'Профиліңіз бірден белсендіріліп, барлық бейне сабақтар, слайдтар мен топтар ашылады.',
        },
      ],
      calloutTitle: 'Студенттік жылдарыңызды TalabaAI арқылы жеңілдетіңіз!',
      calloutDesc: 'Мыңдаған студенттер сабақ оқу, слайдтар мен өзіндік жұмыстарды әзірлеу үшін осы платформаны күнделікті қолдануда.',
      calloutBtn: 'Кіру / Тіркелу',
    },
  },

  ru: {
    header: {
      subtitle: 'Образовательная платформа для студентов Узбекистана',
      greeting: 'Здравствуйте',
      greetingSub: 'С TalabaAI ваши сегодняшние уроки и задания готовы',
      searchPlaceholder: 'Уроки, темы или контакты...',
      loginBtn: 'Вход в систему / Регистрация',
      logoutBtn: 'Выйти из аккаунта',
      ultraVIP: 'Ultra VIP (Безлимит)',
      premium: 'Премиум',
      freeTokens: 'бесплатных токенов',
    },
    navbar: {
      welcome: 'Добро пожаловать',
      student: 'Студент',
      tools: 'Инструменты',
      login: 'Вход',
      loginRequired: 'Требуется вход',
      darslar: 'Уроки',
      darslarFull: 'Онлайн видеоуроки',
      darsxona: 'Аудитория',
      darsxonaFull: 'Онлайн аудитория (Live Stream)',
      groups: 'Группы',
      groupsFull: 'Учебные группы и чат',
      contacts: 'Контакты',
      contactsFull: 'Книга контактов',
      helperTools: 'Инструменты ИИ',
      helperToolsDesc: 'Слайды, Самост. работа, ИИ',
      slides: 'Генератор презентаций',
      slidesDesc: 'Создание современных слайдов с помощью ИИ',
      mustaqil: 'Самост. работа & Word (.docx)',
      mustaqilDesc: 'Рефераты, курсовые и задания',
      research: 'Smart Research AI',
      researchDesc: 'Анализ научных статей и данных',
      history: 'Мои проекты',
      historyDesc: 'Сохраненные слайды и документы',
      settings: 'Настройки',
      settingsFull: 'Настройки и профиль',
      editProfile: 'Редактировать профиль',
      apiKeySettings: 'Настройки API ключа',
      logout: 'Выйти из аккаунта',
    },
    banner: {
      getTabTitle: (tab: NavTab) => {
        switch (tab) {
          case 'darslar': return 'Онлайн видеоуроки';
          case 'darsxona': return 'Онлайн аудитория (Live Stream)';
          case 'groups':
          case 'messenger': return 'Учебные группы и чат';
          case 'contacts': return 'Книга контактов';
          default: return 'Образовательный раздел';
        }
      },
      lockedBadge: (tabTitle: string) => `Раздел «${tabTitle}» — Требуется вход в аккаунт`,
      heroTitlePre: 'Talaba',
      heroTitlePost: ' — Образовательная платформа №1 для студентов Узбекистана',
      heroDesc: (tabTitle: string) =>
        `Чтобы воспользоваться разделом «${tabTitle}», общаться с однокурсниками и смотреть видеоуроки, войдите в свой личный кабинет или зарегистрируйтесь бесплатно за 1 минуту!`,
      btnRegister: '🚀 Бесплатная регистрация / Вход',
      btnTelegram: 'Вход через Telegram бот',
      badgeFreeReg: '100% Бесплатная регистрация',
      badgeFreeLessons: '5 уроков абсолютно бесплатно',
      featuresSubtitle: 'Что вы получаете?',
      featuresTitle: 'Возможности платформы TalabaAI',
      featuresDesc: 'Сразу после регистрации вам откроются все следующие возможности:',
      features: [
        {
          title: 'Онлайн видеоуроки',
          badge: '5 бесплатных',
          desc: 'Высшее образование и профессиональные курсы (Frontend, Python, Кибербезопасность, IELTS). Первые 5 уроков каждого курса бесплатно!',
        },
        {
          title: 'Онлайн аудитория (Live Stream)',
          badge: 'Прямой эфир',
          desc: 'Интерактивные видеоуроки в реальном времени для преподавателей и студентов с демонстрацией экрана и камеры.',
        },
        {
          title: 'Академические группы и чат',
          badge: 'Группы',
          desc: 'Безопасный чат со своей учебной группой, мгновенный обмен файлами, конспектами и домашними заданиями.',
        },
        {
          title: 'Книга контактов',
          badge: 'Личный чат',
          desc: 'Личное общение с однокурсниками и преподавателями, база телефонных номеров и адресов.',
        },
        {
          title: 'Генератор презентаций',
          badge: 'ИИ',
          desc: 'Автоматическое создание ярких, современных и визуальных презентаций на любую тему за 1 минуту.',
        },
        {
          title: 'Самостоятельные работы и Word (.docx)',
          badge: 'Word',
          desc: 'ИИ для подготовки рефератов, курсовых и самостоятельных работ в полном соответствии со стандартами вуза.',
        },
      ],
      stepsTitle: 'Как зарегистрироваться на платформе?',
      stepsDesc: 'Создайте учетную запись всего за 4 простых шага в течение 1 минуты:',
      stepsBtn: 'Зарегистрироваться сейчас',
      steps: [
        {
          step: '1',
          title: 'Нажмите кнопку регистрации',
          desc: 'Нажмите кнопку «Вход» в верхнем правом углу или кнопку «Бесплатная регистрация» ниже.',
        },
        {
          step: '2',
          title: 'Укажите университет и ваши данные',
          desc: 'Выберите ваш университет, укажите имя, номер телефона, придумайте логин и пароль.',
        },
        {
          step: '3',
          title: 'Подтвердите через SMS или Telegram',
          desc: 'Введите 6-значный код подтверждения, отправленный через нашего Telegram бота (@darsliklar_ai_bot) или по SMS.',
        },
        {
          step: '4',
          title: 'Войдите в профиль и начните!',
          desc: 'Ваш профиль мгновенно активируется, открывая доступ ко всем урокам, слайдам и группам.',
        },
      ],
      calloutTitle: 'Облегчите студенческие годы вместе с TalabaAI!',
      calloutDesc: 'Тысячи студентов ежедневно используют эту платформу для обучения, создания слайдов и выполнения работ.',
      calloutBtn: 'Вход / Регистрация',
    },
  },

  en: {
    header: {
      subtitle: 'Educational Platform for Students in Uzbekistan',
      greeting: 'Welcome',
      greetingSub: 'Your lessons and assignments are ready with TalabaAI',
      searchPlaceholder: 'Lessons, topics, or contacts...',
      loginBtn: 'Sign In / Register',
      logoutBtn: 'Log Out',
      ultraVIP: 'Ultra VIP (Unlimited)',
      premium: 'Premium',
      freeTokens: 'free tokens',
    },
    navbar: {
      welcome: 'Welcome',
      student: 'Student',
      tools: 'Tools',
      login: 'Sign In',
      loginRequired: 'Sign in required',
      darslar: 'Lessons',
      darslarFull: 'Online Video Courses',
      darsxona: 'Classroom',
      darsxonaFull: 'Live Classroom (Live Stream)',
      groups: 'Groups',
      groupsFull: 'Academic Groups & Chat',
      contacts: 'Contacts',
      contactsFull: 'Address Book',
      helperTools: 'AI Helper Tools',
      helperToolsDesc: 'Slides, Independent Work, AI',
      slides: 'AI Slide Generator',
      slidesDesc: 'Generate modern presentations with AI',
      mustaqil: 'Independent Work & Word (.docx)',
      mustaqilDesc: 'Essays, term papers, and assignments',
      research: 'Smart Research AI',
      researchDesc: 'Scientific literature and data research',
      history: 'My Projects',
      historyDesc: 'Saved presentations and documents',
      settings: 'Settings',
      settingsFull: 'Settings & Profile',
      editProfile: 'Edit Profile',
      apiKeySettings: 'API Key Settings',
      logout: 'Log Out',
    },
    banner: {
      getTabTitle: (tab: NavTab) => {
        switch (tab) {
          case 'darslar': return 'Online Video Courses';
          case 'darsxona': return 'Live Classroom (Live Stream)';
          case 'groups':
          case 'messenger': return 'Academic Groups & Chat';
          case 'contacts': return 'Address Book';
          default: return 'Educational Department';
        }
      },
      lockedBadge: (tabTitle: string) => `«${tabTitle}» Section — Sign in required`,
      heroTitlePre: 'Talaba',
      heroTitlePost: ' — #1 Educational Platform for Students in Uzbekistan',
      heroDesc: (tabTitle: string) =>
        `To access the «${tabTitle}» section, chat with classmates, and watch video lessons, sign in to your personal account or register for free in 1 minute!`,
      btnRegister: '🚀 Free Sign Up / Log In',
      btnTelegram: 'Sign In via Telegram Bot',
      badgeFreeReg: '100% Free registration',
      badgeFreeLessons: '5 lessons completely free',
      featuresSubtitle: 'What will you get?',
      featuresTitle: 'Features of the TalabaAI Platform',
      featuresDesc: 'As soon as you register, all the following features will be unlocked for you:',
      features: [
        {
          title: 'Online Video Courses',
          badge: '5 Free',
          desc: 'Higher education and professional subjects (Frontend, Python, Cybersecurity, IELTS). 5 lessons of each subject completely free!',
        },
        {
          title: 'Live Classroom (Live Stream)',
          badge: 'Live Stream',
          desc: 'Real-time interactive video classes for teachers and students with screen and camera sharing capabilities.',
        },
        {
          title: 'Academic Groups & Chat',
          badge: 'Groups',
          desc: 'Secure group chat with your classmates, instant sharing of lecture notes, study materials, and homework.',
        },
        {
          title: 'Contact Directory',
          badge: 'Direct Chat',
          desc: 'Private messaging with fellow students and faculty members, directory of phone numbers and emails.',
        },
        {
          title: 'AI Slide Generator',
          badge: 'AI',
          desc: 'Automatically create modern, colorful, and engaging presentations on any subject in 1 minute.',
        },
        {
          title: 'Independent Work & Word (.docx)',
          badge: 'Word',
          desc: 'AI that generates complete essays, research papers, and assignments matching academic standards.',
        },
      ],
      stepsTitle: 'How to Register on the Platform?',
      stepsDesc: 'Create your account in just 4 simple steps within 1 minute:',
      stepsBtn: 'Register Now',
      steps: [
        {
          step: '1',
          title: 'Click the Register button',
          desc: 'Click «Sign In» in the top-right corner or the «Free Sign Up» button below.',
        },
        {
          step: '2',
          title: 'Select your University and enter details',
          desc: 'Choose your university, enter your full name, phone number, choose a login and password.',
        },
        {
          step: '3',
          title: 'Verify via SMS or Telegram',
          desc: 'Enter the 6-digit verification code sent via our Telegram bot (@darsliklar_ai_bot) or SMS.',
        },
        {
          step: '4',
          title: 'Log in to your profile and begin!',
          desc: 'Your profile is activated instantly, granting full access to courses, slides, and study groups.',
        },
      ],
      calloutTitle: 'Make your student years easier with TalabaAI!',
      calloutDesc: 'Thousands of students use this platform daily to study courses, generate slides, and complete assignments.',
      calloutBtn: 'Sign In / Register',
    },
  },
};
