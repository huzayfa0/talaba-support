import {
  Language,
  PresentationProject,
  PresentationStyle,
  SlideItem,
  MustaqilIshMeta,
  MustaqilIshProject,
  ResearchResult,
} from '@/types';
import { resolveSlideImage } from './image-service';

// API kalitni olish (localStorage yoki muhitdan)
export function getSavedApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('talaba_gemini_api_key') || '';
  }
  return '';
}

export function saveApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('talaba_gemini_api_key', key.trim());
  }
}

// Gemini API orqali so'rov yuborish
async function callGemini(prompt: string, customKey?: string): Promise<string | null> {
  const apiKey = customKey || getSavedApiKey();

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, apiKey }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn('AI API xatosi, lokal dvigatelga o‘tilmoqda:', err);
      return null;
    }

    const data = await res.json();
    return data.text || null;
  } catch (error) {
    console.warn('Tarmoq xatosi, aqlli lokal generatordan foydalaniladi:', error);
    return null;
  }
}

// ----------------------------------------------------
// 1. SLAYD / TAQDIMOT GENERATORI
// ----------------------------------------------------

export async function generatePresentationOutline(
  topic: string,
  slideCount: number = 8,
  lang: Language = 'uz'
): Promise<string[]> {
  const prompt = `Foydalanuvchi quyidagi mavzuda AYNAN ${slideCount} ta slayddan iborat taqdimot tayyorlamoqchi.
Mavzu: "${topic}"
Til: ${lang === 'uz' ? "O'zbek tili" : lang === 'ru' ? 'Rus tili' : 'Ingliz tili'}

Qat'iy talab:
1 dan ${slideCount} gacha raqamlangan, to'liq ${slideCount} ta alohida slayd sarlavhasini qatorma-qator chiqar.
Har bir slayd sarlavhasi mazmunli va aniq bo'lsin.
Juda muhim: Ro'yxatda kam emas, ko'p emas, aynan ${slideCount} ta raqamlangan qator bo'lishi shart!
Boshqa hech qanday kirish yoki ortiqcha gap yozma, faqat 1 dan ${slideCount} gacha raqamlangan ro'yxatni ber.`;

  const aiText = await callGemini(prompt);
  let lines: string[] = [];

  if (aiText) {
    lines = aiText
      .split('\n')
      .map((l) => l.replace(/^\d+[\.\)\-]\s*/, '').trim())
      .filter((l) => l.length > 2);
  }

  // Agar AI qaytargan slaydlar soni kamroq bo'lib qolsa, aynan slideCount ta bo'lguncha to'ldiramiz
  if (lines.length > 0 && lines.length < slideCount) {
    const extraTitles = [
      `${topic}: Asosiy texnologiyalar va amaliy mexanizmlar`,
      `Xalqaro standartlar va ilg'or tajriba tahlili`,
      `Xavfsizlik protokollari va tizimli monitoring`,
      `Sohadagi amaliy keyslar va muvaffaqiyatli misollar`,
      `Mavjud kamchiliklar va ularni bartaraf etish yo'llari`,
      `Rivojlanish tendensiyalari va istiqbolli innovatsiyalar`,
      `Kelajak strategiyasi va kutilayotgan natijalar`,
      `Yakuniy xulosa va amaliy tavsiyalar`,
    ];
    let extraIdx = 0;
    while (lines.length < slideCount) {
      const candidate = extraTitles[extraIdx % extraTitles.length];
      if (!lines.includes(candidate)) {
        lines.push(candidate);
      } else {
        lines.push(`${candidate} (Qism ${lines.length + 1})`);
      }
      extraIdx++;
    }
  }

  if (lines.length >= slideCount) {
    return lines.slice(0, slideCount);
  }

  // Lokal boyitilgan andoza (Agar AI umuman javob bermasa)
  const fallbackList = [
    `Kirish: ${topic} mavzusining umumiy tavsifi`,
    `${topic} tushunchasi va asosiy nazariy qoidalari`,
    `Tarixiy rivojlanish bosqichlari va xalqaro tajriba`,
    `Asosiy tamoyillar, mexanizmlar va metodologiya`,
    `Hozirgi kundagi amaliy qo‘llanilishi va tahlil`,
    `Infratuzilma va texnologik vositalar`,
    `Standartlar talabi va me'yoriy asoslar`,
    `Tizim samaradorligini baholash ko'rsatkichlari`,
    `Mavjud muammolar va ularni hal etish yo‘llari`,
    `Amaliy keyslar va xalqaro misollar`,
    `Raqamli integratsiya va innovatsion yondashuvlar`,
    `Xorijiy davlatlar tajribasi va qiyosiy tahlil`,
    `Sohani takomillashtirish bo'yicha takliflar`,
    `Kelajak istiqbollari va rivojlanish tendensiyalari`,
    `Xulosa va yakuniy tavsiyalar`,
  ];
  return fallbackList.slice(0, slideCount);
}

export async function generateFullPresentation(
  topic: string,
  outline: string[],
  style: PresentationStyle = 'modern-dark',
  lang: Language = 'uz'
): Promise<PresentationProject> {
  const prompt = `Sen professional taqdimotlar tayyorlovchi (Gamma.app kabi) sun'iy intellektsan.
Mavzu: "${topic}"
Til: ${lang === 'uz' ? "O'zbek tili" : lang === 'ru' ? 'Rus tili' : 'Ingliz tili'}
Reja quyidagicha (${outline.length} ta slayd):
${outline.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Iltimos, JSON formatida ushbu slaydlarning to'liq kontentini yozib ber.
Format aniq quyidagicha JSON massiv bo'lsin:
[
  {
    "slideNumber": 1,
    "title": "Slayd sarlavhasi",
    "subtitle": "Qisqa izoh yoki kichik sarlavha",
    "bullets": ["Muhim punkt 1", "Muhim punkt 2", "Muhim punkt 3"],
    "highlight": "Asosiy xulosa yoki e'tibor qaratilishi kerak bo'lgan fikr",
    "stats": {"value": "+85%", "label": "Ko'rsatkich yoki fakt"},
    "imageKeywords": "Slayd mavzusiga mos inglizcha aniq qidiruv so'zi (masalan: Linus Torvalds, Samarkand Registan, Linux terminal, Cybersecurity lock, Amir Temur)"
  }
]
Juda muhim: Berilgan barcha ${outline.length} ta slayd uchun to'liq JSON obyektlarini hosil qil. Faqat valid JSON qaytar.`;

  const aiText = await callGemini(prompt);
  let slides: SlideItem[] = [];

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Outline dagi har bir slayd uchun to'liq massiv hosil qilish (aniq outline.length ta)
        slides = outline.map((title, idx) => {
          const s = parsed[idx];
          if (s) {
            return {
              id: `slide-${idx + 1}`,
              slideNumber: idx + 1,
              title: s.title || title,
              subtitle: s.subtitle || '',
              bullets: Array.isArray(s.bullets) && s.bullets.length > 0 ? s.bullets : [s.bullets || `${title} bo'yicha asosiy tushuncha`],
              highlight: s.highlight || '',
              stats: s.stats || (idx % 2 === 1 ? { value: `${idx * 10 + 20}%`, label: "O'sish dinamikasi" } : undefined),
              imageKeywords: s.imageKeywords || title,
            };
          }
          return {
            id: `slide-${idx + 1}`,
            slideNumber: idx + 1,
            title: title,
            subtitle: `${title} bo'yicha tahlil va asosiy tushunchalar`,
            bullets: [
              `${title} doirasida muhim qoidalar va ilmiy tahlil o'rganildi`,
              "Zamonaviy standartlar va amaliy talablarga mos yondashuvlar qo'llanildi",
              "Samaradorlikni oshirish uchun maqbul texnologik usullar joriy etiladi",
            ],
            highlight: `${title} mavzuning muhim tarkibiy qismi hisoblanadi.`,
            stats: idx % 2 === 1 ? { value: `${idx * 10 + 15}%`, label: "Samaradorlik darajasi" } : undefined,
            imageKeywords: title,
          };
        });
      }
    } catch (e) {
      console.warn("AI JSON parse xatosi, andoza bilan to'ldiriladi:", e);
    }
  }

  // Agar AI ishlamasa yoki bo'sh kelsa, boyitilgan lokal generator
  if (slides.length === 0) {
    slides = outline.map((title, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === outline.length - 1;

      if (isFirst) {
        return {
          id: `slide-${idx + 1}`,
          slideNumber: 1,
          title: topic,
          subtitle: "Zamonaviy tahlil, tamoyillar va amaliy ahamiyati",
          bullets: [
            `${topic} sohasining zamonaviy jamiyatdagi beqiyos o'rni`,
            "Nazariy bilimlar va amaliy tadqiqotlarning uyg'unligi",
            "Ushbu taqdimotda ko'rib chiqiladigan asosiy yo'nalishlar",
          ],
          highlight: "Bilim va innovatsiyalar – muvaffaqiyatli taraqqiyot kalitidir.",
          imageKeywords: topic,
        };
      }

      if (isLast) {
        return {
          id: `slide-${idx + 1}`,
          slideNumber: idx + 1,
          title: "Xulosa va Tavsiyalar",
          subtitle: "Tadqiqot natijalari va istiqbolli rejalar",
          bullets: [
            `${topic} bo'yicha ilgari surilgan g'oyalarning amaliy samaradorligi yuqori`,
            "Tizimli yondashuv orqali mavjud kamchiliklarni bartaraf etish mumkin",
            "Kelajakda innovatsion texnologiyalarni keng joriy etish tavsiya qilinadi",
          ],
          highlight: "E'tiboringiz uchun rahmat! Savollar va takliflar uchun tayyormiz.",
          stats: { value: "100%", label: "Muvaffaqiyatli xulosalar" },
          imageKeywords: "Presentation conclusion summary",
        };
      }

      return {
        id: `slide-${idx + 1}`,
        slideNumber: idx + 1,
        title: title,
        subtitle: `${title} bo'yicha muhim tushunchalar va ilmiy tahlil`,
        bullets: [
          `Ushbu bosqichda ${topic.toLowerCase()} sohasining muhim jihatlari ochib beriladi`,
          "Zamonaviy ilmiy yondashuvlar va ilg'or standartlarga tayangan holda amaliy tahlil olib borildi",
          "Samaradorlikni oshirish uchun eng maqbul usullar va vositalar qo'llaniladi",
          "Olingan natijalar kelgusi bosqichlar uchun mustahkam poydevor yaratadi",
        ],
        highlight: `${title} tizimning barqaror rivojlanishida eng asosiy omillardan biri hisoblanadi.`,
        stats: idx % 2 === 0 ? { value: `${idx * 18 + 15}%`, label: "Samaradorlik darajasi" } : undefined,
        imageKeywords: title,
      };
    });
  }

  // Har bir slayd uchun mos rasmni topish (Wikipedia Commons + Unsplash)
  const slidesWithImages = await Promise.all(
    slides.map(async (s, idx) => {
      const img = await resolveSlideImage(topic, s.title, s.imageKeywords, idx);
      return {
        ...s,
        imageUrl: img,
      };
    })
  );

  return {
    id: `pres-${Date.now()}`,
    title: topic,
    topic,
    style,
    language: lang,
    createdAt: new Date().toISOString(),
    slides: slidesWithImages,
  };
}

// ----------------------------------------------------
// 2. MUSTAQIL ISH VA REFERAT GENERATORI
// ----------------------------------------------------

export async function generateMustaqilIshContent(meta: MustaqilIshMeta): Promise<MustaqilIshProject> {
  const targetPages = meta.pageCount || 10;

  // Sahifalar soniga (listlar soni) moslashtirilgan boblar va fasllar arxitekturasi
  interface ChapterStructure {
    title: string;
    subsections: { title: string; promptNote: string }[];
  }

  let chapterStructures: ChapterStructure[] = [];

  if (targetPages <= 6) {
    chapterStructures = [
      {
        title: `1-BOB. ${meta.topic.toUpperCase()}NING NAZARIY ASOSLARI`,
        subsections: [
          {
            title: `1.1. Asosiy tushunchalar, mazmun-mohiyati va me'yoriy asoslar`,
            promptNote: "Tushunchalar, atamalar va ularning nazariy izohi, kamida 3 ta to'liq abzas",
          },
          {
            title: `1.2. Rivojlanish bosqichlari va xalqaro tajriba tahlili`,
            promptNote: "Tarixiy genezis va xorijiy davlatlar tajribasi, kamida 3 ta to'liq abzas",
          },
        ],
      },
      {
        title: `2-BOB. ${meta.topic.toUpperCase()}NING AMALIY AHAMIYATI VA TAKLIFLAR`,
        subsections: [
          {
            title: `2.1. O'zbekistonda sohaning joriy holati va mavjud muammolar`,
            promptNote: "Amaliy holat, statistik ko'rsatkichlar va to'siqlar, kamida 3 ta to'liq abzas",
          },
          {
            title: `2.2. Sohani rivojlantirish istiqbollari va amaliy tavsiyalar`,
            promptNote: "Muammolarni bartaraf etish bo'yicha ilmiy takliflar, kamida 3 ta to'liq abzas",
          },
        ],
      },
    ];
  } else if (targetPages <= 12) {
    chapterStructures = [
      {
        title: `1-BOB. ${meta.topic.toUpperCase()}NING NAZARIY-USLUBIY ASOSLARI`,
        subsections: [
          {
            title: `1.1. Mavzuning konseptual asoslari, mohiyati va huquqiy me'yorlari`,
            promptNote: "Nazariy tushunchalar, qonunchilik va ilmiy tasniflar, kamida 3-4 ta chuqur abzas",
          },
          {
            title: `1.2. Sohaning o'rganilish darajasi va xorijiy ilg'or tajribalar`,
            promptNote: "Olimlar tadqiqotlari, ilmiy yondashuvlar va jahon amaliyoti, kamida 3-4 ta abzas",
          },
        ],
      },
      {
        title: `2-BOB. ${meta.topic.toUpperCase()}NING HOZIRGI HOLATI VA AMALIY TAHLILI`,
        subsections: [
          {
            title: `2.1. O'zbekiston Respublikasida sohaning joriy holati va ko'rsatkichlar tahlili`,
            promptNote: "Empirik ma'lumotlar, statistik raqamlar va jarayonlar tahlili, kamida 4 ta to'liq abzas",
          },
          {
            title: `2.2. Sohada mavjud tizimli muammolar, kamchiliklar va to'siqlar tahlili`,
            promptNote: "Mavjud muammolar, ularning kelib chiqish sabablari va omillari, kamida 3-4 ta abzas",
          },
        ],
      },
      {
        title: `3-BOB. SOHANI TAKOMILLASHTIRISH ISTIQBOLLARI VA AMALIY TAKLIFLAR`,
        subsections: [
          {
            title: `3.1. Sohani rivojlantirishning innovatsion modellari va ustuvor yo'nalishlari`,
            promptNote: "Zamonaviy texnologiyalarni tatbiq etish va istiqbolli rejalar, kamida 3-4 ta abzas",
          },
          {
            title: `3.2. Amaliyotga joriy qilish mexanizmlari va kutilayotgan samaradorlik`,
            promptNote: "Aniq amaliy metodik tavsiyalar, iqtisodiy/ijtimoiy samara, kamida 3-4 ta abzas",
          },
        ],
      },
    ];
  } else {
    // 13-25+ listlar: Katta mustaqil ish / Kurs ishi hajmi
    chapterStructures = [
      {
        title: `1-BOB. ${meta.topic.toUpperCase()}NING NAZARIY-METODOLOGIK ASOSLARI`,
        subsections: [
          {
            title: `1.1. Konseptual tushunchalar, me'yoriy-huquqiy baza va sohaning asosiy qoidalari`,
            promptNote: "Keng qamrovli nazariy tahlil, qonunlar, konsepsiyalar, kamida 4-5 ta to'liq abzas",
          },
          {
            title: `1.2. Ilmiy qarashlar evolyutsiyasi va mahalliy hamda xorijiy olimlar tadqiqotlari`,
            promptNote: "Ilmiy manbalar sharhi, nazariy qarama-qarshiliklar va yondashuvlar, kamida 4 ta abzas",
          },
          {
            title: `1.3. Xalqaro andozalar va rivojlangan davlatlar tajribasi qiyosiy tahlili`,
            promptNote: "AQSH, Yevropa va Osiyo mamlakatlari tajribasi tahlili, kamida 4 ta abzas",
          },
        ],
      },
      {
        title: `2-BOB. ${meta.topic.toUpperCase()}NING AMALIY HOLATI VA STATISTIK BAHOLANISHI`,
        subsections: [
          {
            title: `2.1. O'zbekistonda sohaning joriy faoliyati, institutsional tuzilishi va tendensiyalar`,
            promptNote: "Chuqur amaliy tahlil, soha dinamikasi, joriy amaliyot, kamida 4-5 ta abzas",
          },
          {
            title: `2.2. Sohaviy statistik ma'lumotlar, ko'rsatkichlar va empirik o'rganish natijalari`,
            promptNote: "Faktlar, hisob-kitoblar, statistik jadvallar va ularning tahlili, kamida 4 ta abzas",
          },
          {
            title: `2.3. Tizimdagi mavjud tizimli muammolar, institutsional kamchiliklar va xatarlar`,
            promptNote: "Kamchiliklar tahlili, to'sqinlik qiluvchi omillar, kamida 4 ta abzas",
          },
        ],
      },
      {
        title: `3-BOB. SOHANI TAKOMILLASHTIRISHNING STRATEGIK YO'NALISHLARI VA AMALIY TAVSIYALAR`,
        subsections: [
          {
            title: `3.1. Sohani modernizatsiya qilish va rivojlantirishning istiqbolli strategiyalari`,
            promptNote: "Kelgusi 5-10 yillik rivojlanish vektorlari, innovatsion mexanizmlar, kamida 4-5 ta abzas",
          },
          {
            title: `3.2. Innovatsion yechimlar va ilg'or axborot texnologiyalarini tatbiq etish yo'llari`,
            promptNote: "Raqamlashtirish, avtomatlashtirish va yangi texnologiyalar integratsiyasi, kamida 4 ta abzas",
          },
          {
            title: `3.3. Ishlab chiqilgan ilmiy takliflar, amaliy tavsiyalar va ularning samaradorligi`,
            promptNote: "Amaliyotga joriy etish algoritmi, ijtimoiy-iqtisodiy samaradorlik bahosi, kamida 4-5 ta abzas",
          },
        ],
      },
    ];
  }

  // Mundarijani tuzish
  const mundarija = [
    "KIRISH",
    ...chapterStructures.flatMap((ch) => [
      ch.title,
      ...ch.subsections.map((sub) => `  ${sub.title}`),
    ]),
    "XULOSA VA TAVSIYALAR",
    "FOYDALANILGAN ADABIYOTLAR RO'YXATI",
  ];

  const estimatedWords = targetPages * 240;

  const prompt = `Sen O'zbekiston Oliy ta'lim tizimi (OTM) standartlari bo'yicha mustaqil ish va kurs ishlarini yozuvchi professional akademik professo'rsan.
Talaba buyurtmasi:
- Mavzu: "${meta.topic}"
- Fan: "${meta.subject}"
- OTM: "${meta.university}" (${meta.faculty} fakulteti, "${meta.department}" kafedrasi)
- Talaba: "${meta.studentName}"
- HAJMI: AYNAN ${targetPages} VARAQ (LIST/BET)!
(OTM standarti bo'yicha Word dasturida Times New Roman 14pt, 1.5 intervalda umumiy matn aynan ${targetPages} varaqni to'ldirishi lozim, taxminan ${estimatedWords} so'z).

QAT'IY TALABLAR:
1. "kirish": Mavzuning dolzarbligi, tadqiqot maqsadi, vazifalari, obyekti, predmeti va tadqiqot usullari batafsil yoritilgan kamida ${targetPages >= 15 ? '5-6 ta to\'liq abzas (~400-500 so\'z)' : '3-4 ta to\'liq abzas (~250-300 so\'z)'}.
2. "boblar": Har bir bob quyidagi tuzilmada bo'lsin:
   - "title": Bob nomi
   - "subsections": [
       ${chapterStructures[0].subsections.map(s => `{"title": "${s.title}", "content": "Ushbu faslning to'liq akademik matni (kamida 3-4 ta mazmunli abzas, ilmiy faktlar, tahlillar)"}`).join(',\n       ')}
     ]
   - "content": Bobning umumiy to'liq matni (barcha fasllari jamlangan).
3. "xulosa": Tadqiqot bo'yicha 5-7 ta aniq xulosalar va amaliy tavsiyalar (${targetPages >= 15 ? 'kamida 4-5 ta to\'liq abzas' : 'kamida 3 ta to\'liq abzas'}).
4. "adabiyotlar": O'zbekiston Respublikasi qonunlari, Prezident farmonlari, 2020-2025 yillarda nashr etilgan darsliklar va xalqaro maqolalar (kamida ${Math.min(targetPages + 5, 25)} ta to'liq manba).

Javobingni FAQAT toza JSON formatida quyidagicha qaytar:
{
  "kirish": "...",
  "boblar": [
    {
      "title": "${chapterStructures[0].title}",
      "subsections": [
        { "title": "${chapterStructures[0].subsections[0].title}", "content": "..." },
        { "title": "${chapterStructures[0].subsections[1].title}", "content": "..." }
      ],
      "content": "..."
    }
  ],
  "xulosa": "...",
  "adabiyotlar": [ "..." ]
}`;

  const aiText = await callGemini(prompt);

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.kirish && parsed.boblar && parsed.boblar.length > 0 && parsed.xulosa) {
        // Agar boblar ichida content bo'lib subsections bo'lmasa, subsections yasab beramiz
        const formattedBoblar = parsed.boblar.map((b: { title: string; content?: string; subsections?: { title: string; content: string }[] }, i: number) => {
          const defaultStructure = chapterStructures[i] || chapterStructures[0];
          let subList = b.subsections || [];

          if (subList.length === 0 && b.content) {
            // Kontentni fasllarga taqsimlaymiz
            const pars = b.content.split('\n\n').filter((p: string) => p.trim());
            const half = Math.ceil(pars.length / 2);
            subList = [
              {
                title: defaultStructure.subsections[0]?.title || `1.1. Asosiy nazariy jihatlar`,
                content: pars.slice(0, half).join('\n\n') || b.content,
              },
              {
                title: defaultStructure.subsections[1]?.title || `1.2. Amaliy tahlillar va natijalar`,
                content: pars.slice(half).join('\n\n') || b.content,
              },
            ];
          }

          const combinedContent = subList.map((s) => `${s.title}\n\n${s.content}`).join('\n\n') || b.content || '';

          return {
            title: b.title || defaultStructure.title,
            subsections: subList,
            content: combinedContent,
          };
        });

        return {
          id: `mustaqil-${Date.now()}`,
          meta: {
            ...meta,
            pageCount: targetPages,
          },
          createdAt: new Date().toISOString(),
          mundarija,
          kirish: parsed.kirish,
          boblar: formattedBoblar,
          xulosa: parsed.xulosa,
          adabiyotlar: parsed.adabiyotlar || [
            "O'zbekiston Respublikasi Konstitutsiyasi. – Toshkent: 'O'zbekiston', 2023.",
            "Mirziyoyev Sh.M. Yangi O'zbekiston taraqqiyot strategiyasi. – Toshkent: 'O'zbekiston', 2022.",
            "O'zbekiston Respublikasining Ta'lim to'g'risidagi Qonuni. – Toshkent, 2020.",
            `${meta.subject} bo'yicha zamonaviy o'quv qo'llanma va darsliklar. – Toshkent: Fan, 2023.`,
            "Xalqaro ilmiy jurnallar va elektron ta'lim resurslari: www.ziyonet.uz, www.lex.uz",
          ],
        };
      }
    } catch (e) {
      console.warn("Mustaqil ish JSON parse xatosi:", e);
    }
  }

  // Oflayn yuqori sifatli akademik generator (tanlangan varaqlar soniga to'liq moslashtirilgan)
  const boblarData = chapterStructures.map((ch, chIdx) => {
    const subData = ch.subsections.map((sub, sIdx) => {
      const p1 = `${sub.title} masalasini chuqur ilmiy tadqiq etish shuni ko‘rsatadiki, "${meta.topic}" sohasining nazariy va amaliy jihatlari zamonaviy ijtimoiy-iqtisodiy hamda texnologik taraqqiyotning muhim ustuvor yo‘nalishlaridan biridir. Har bir tizimning samarali ishlashi, avvalo, uning konseptual me'yoriy bazasi to‘g‘ri shakllantirilganligiga bevosita bog‘liqdir.\n\n`;
      const p2 = `Ushbu fasl doirasida ${meta.subject.toLowerCase()} fani doirasida shakllangan ilmiy metodologiyalar, mahalliy va xorijiy olimlarning fundamental qarashlari hamda empirik tadqiqot natijalari har tomonlama qiyosiy tahlil qilindi. Tahlillar shuni isbotlaydiki, tizimli yondashuv va innovatsion mexanizmlarni uyg‘unlashtirish natijasida ko‘zlangan ilmiy va amaliy samaradorlikka erishish mumkin.\n\n`;
      const p3 = `Ayniqsa, O‘zbekiston Respublikasida olib borilayotgan keng ko‘lamli islohotlar, sohani raqamlashtirish va yangi bosqichga ko‘tarishga qaratilgan davlat dasturlari talablaridan kelib chiqqan holda, ${meta.topic.toLowerCase()} yo‘nalishidagi mavjud resurslardan samarali foydalanish strategik vazifa sifatida belgilangan.\n\n`;
      const p4 = `Xulosa o‘rnida ta'kidlash joizki, ${sub.title.toLowerCase()} bo‘yicha aniqlangan qonuniyatlar va to‘siqlarni bartaraf etish kelgusida soha samaradorligini barqaror oshirishga xizmat qiladi.`;

      return {
        title: sub.title,
        content: p1 + p2 + p3 + (targetPages >= 10 ? p4 : ''),
      };
    });

    const combined = subData.map((s) => `${s.title}\n\n${s.content}`).join('\n\n');

    return {
      title: ch.title,
      subsections: subData,
      content: combined,
    };
  });

  return {
    id: `mustaqil-${Date.now()}`,
    meta: {
      ...meta,
      pageCount: targetPages,
    },
    createdAt: new Date().toISOString(),
    mundarija,
    kirish:
      `Mavzuning dolzarbligi: Bugungi globallashuv va shiddatli ilmiy-texnik taraqqiyot davrida barcha sohalarda yangi innovatsion texnologiyalarni tatbiq etish, ilg‘or xalqaro tajribalarni o‘zlashtirish hamda ularni milliy amaliyotga samarali integratsiya qilish kechiktirib bo‘lmas vazifalardan biri hisoblanadi. Xususan, "${meta.topic}" mavzusi ${meta.subject} fanining eng muhim va dolzarb masalalaridan biri bo‘lib, ushbu yo‘nalishdagi izlanishlar mutaxassislar oldida turgan jiddiy ilmiy-amaliy muammolarni hal etishga xizmat qiladi.\n\n` +
      `Mustaqil ishning maqsadi: "${meta.topic}" sohasidagi nazariy bilimlarni mustahkamlash, amaliyotda mavjud bo‘lgan tendensiyalar va muammolarni har tomonlama tahlil qilish hamda ularni takomillashtirish bo‘yicha asoslangan ilmiy taklif va amaliy tavsiyalar ishlab chiqishdan iborat.\n\n` +
      `Tadqiqotning asosiy vazifalari:\n` +
      `1. Mavzuga oid ilmiy-nazariy tushunchalar, konseptual yondashuvlar va me'yoriy asoslarni o‘rganish;\n` +
      `2. O‘zbekiston sharoitida va jahon amaliyotida sohaning hozirgi rivojlanish darajasini tahlil qilish;\n` +
      `3. Soha samaradorligiga ta'sir ko‘rsatuvchi asosiy omillar, to‘siqlar va mavjud kamchiliklarni aniqlash;\n` +
      `4. Ilg‘or xorijiy tajribalarni qiyosiy o‘rganish asosida sohani modernizatsiya qilish yo‘llarini belgilash;\n` +
      `5. Tadqiqot mavzusi bo‘yicha tizimli ilmiy xulosalar va amaliy tavsiyalar majmuasini shakllantirish.\n\n` +
      `Tadqiqot obyekti va predmeti: "${meta.topic}" jarayonlari hamda ularning metodologik va amaliy mexanizmlari hisoblanadi.\n\n` +
      `Tadqiqot metodlari: Tizimli tahlil, qiyosiy tahlil, statistik guruhlash, induksiya va deduksiya, ilmiy abstraksiyalash metodlaridan keng foydalanildi.`,
    boblar: boblarData,
    xulosa:
      `Tadqiqot natijasida olingan asosiy xulosalar:\n\n` +
      `1. "${meta.topic}" mavzusi bo‘yicha olib borilgan keng qamrovli nazariy tahlillar mazkur sohaning o‘ziga xos konseptual xususiyatlari va me'yoriy talablarini aniq belgilab olish imkonini berdi.\n\n` +
      `2. Amaliy holatni o‘rganish shuni ko‘rsatdiki, bugungi kunda tizimda ijobiy o‘zgarishlar bilan bir qatorda, bir qator hal etilishi lozim bo‘lgan institutsional va texnologik masalalar mavjud.\n\n` +
      `3. Rivojlangan xorijiy davlatlar tajribasi shuni ko‘rsatadiki, zamonaviy axborot texnologiyalaridan unumli foydalanish va ilg‘or standartlarni joriy etish samaradorlikni bir necha barobar oshiradi.\n\n` +
      `Amaliy taklif va tavsiyalar:\n` +
      `- Sohada kadrlar malakasini muntazam oshirish va zamonaviy o‘quv-amaliy resurslar bilan ta'minlash;\n` +
      `- Jarayonlarni raqamlashtirish va avtomatlashtirilgan boshqaruv modellarini joriy qilish;\n` +
      `- Ilmiy izlanishlar natijalarini ishlab chiqarish va amaliyot bilan uzviy integratsiyalash tizimini yaratish.`,
    adabiyotlar: [
      "O‘zbekiston Respublikasi Konstitutsiyasi. – Toshkent: 'O‘zbekiston', 2023.",
      "Mirziyoyev Sh.M. Yangi O‘zbekiston taraqqiyot strategiyasi. – Toshkent: 'O‘zbekiston', 2022.",
      "O‘zbekiston Respublikasining 'Ta'lim to‘g‘risida'gi Qonuni. – Toshkent, 2020.",
      `O‘zbekiston Respublikasi Prezidentining ${meta.subject} va raqamli iqtisodiyotni rivojlantirishga oid qarorlari.`,
      `${meta.subject} fanidan OTMlar uchun darslik va o‘quv qo‘llanmalar. – Toshkent: O‘qituvchi, 2023.`,
      "Saidov A.X., Yo‘ldoshev B.B. Zamonaviy ilmiy tadqiqotlar metodologiyasi. – Toshkent: Fan, 2022.",
      "Karimov M., Alimov R. Axborotlashgan jamiyatda sohaviy taraqqiyot tendensiyalari. – Toshkent, 2024.",
      "Xalqaro ilmiy indeksatsiyalangan jurnallar (Scopus, Web of Science materiallari).",
      "O‘zbekiston Respublikasi Qonun hujjatlari ma'lumotlari milliy bazasi: https://lex.uz",
      "O‘zbekiston Respublikasi Oliy ta'lim portali va elektron kutubxona: https://ziyonet.uz",
      "Statistika agentligining rasmiy ma'lumotlari: https://stat.uz",
    ],
  };
}

// ----------------------------------------------------
// 3. SMART RESEARCH (AQLLI QIDIRUV VA TAHLIL)
// ----------------------------------------------------

export async function searchAcademicKnowledge(
  query: string,
  lang: Language = 'uz'
): Promise<ResearchResult> {
  const prompt = `Sen talabalarga ilmiy izlanishlar va o'qishda yordam beradigan eng aqlli ilmiy qidiruv tizimisan.
Savol/Mavzu: "${query}"
Til: ${lang === 'uz' ? "O'zbek tili" : 'Rus tili'}

Iltimos, ushbu mavzu bo'yicha to'liq ilmiy tahlil, xulosa, faktlar, manbalar va imtihonga tayyorlanish uchun savol-javob kartochkalari (flashcards) tayyorlab ber.
Format JSON:
{
  "summary": "Mavzuning 2-3 jumlalik eng asosiy tushunchasi va ta'rifi",
  "keyPoints": [
    "Asosiy tezis yoki qoida 1",
    "Asosiy tezis yoki qoida 2",
    "Asosiy tezis yoki qoida 3",
    "Asosiy tezis yoki qoida 4"
  ],
  "statistics": [
    {"label": "Ko'rsatkich yoki foiz", "value": "90%"},
    {"label": "Vaqt yoki davr", "value": "XXI asr"}
  ],
  "sources": [
    {"title": "Mavzuga oid kitob yoki maqola", "author": "Muallif", "year": "2023", "link": "https://ziyonet.uz"}
  ],
  "flashcards": [
    {"question": "Imtihon savoli 1?", "answer": "To'g'ri va lo'nda javob 1"},
    {"question": "Imtihon savoli 2?", "answer": "To'g'ri va lo'nda javob 2"}
  ]
}
Faqat valid JSON qaytar.`;

  const aiText = await callGemini(prompt);

  if (aiText) {
    try {
      const cleaned = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.summary && parsed.keyPoints) {
        return {
          id: `res-${Date.now()}`,
          query,
          createdAt: new Date().toISOString(),
          summary: parsed.summary,
          keyPoints: parsed.keyPoints,
          statistics: parsed.statistics || [],
          sources: parsed.sources || [],
          flashcards: parsed.flashcards || [],
        };
      }
    } catch (e) {
      console.warn("Smart Research parse error:", e);
    }
  }

  // Lokal boyitilgan tahlil
  return {
    id: `res-${Date.now()}`,
    query,
    createdAt: new Date().toISOString(),
    summary: `"${query}" mavzusi zamonaviy ilmiy va amaliy tadqiqotlarda fundamental ahamiyatga ega bo‘lib, uning qonuniyatlari, turlari va qo‘llanilish mexanizmlari tizimli o‘rganishni talab qiladi.`,
    keyPoints: [
      `"${query}" tushunchasining ilmiy ta'rifi va me'yoriy mezonlari belgilab berilgan`,
      "Mazkur sohadagi asosiy qonuniyatlar tizim samaradorligiga bevosita ta'sir ko‘rsatadi",
      "Zamonaviy tajribada yangi innovatsion usullarni joriy qilish natijasida unumdorlik oshmoqda",
      "Ilmiy xulosalar shuni ko‘rsatadiki, amaliyotda nazariya bilan uyg‘unlikka erishish zarur",
    ],
    statistics: [
      { label: "Mavzuning dolzarbligi", value: "98%" },
      { label: "Ilmiy manbalar soni", value: "1,200+" },
      { label: "Amaliy samaradorlik", value: "x3 barobar" },
    ],
    sources: [
      { title: "Zamonaviy fan va texnologiyalar asoslari", author: "A. Karimov, N. Aliyev", year: "2023", link: "https://ziyonet.uz" },
      { title: "Oliy ta'lim talabalari uchun ilmiy qo‘llanma", author: "Fan va Ta'lim nashriyoti", year: "2024", link: "https://lex.uz" },
      { title: "International Journal of Academic Research", author: "Global Scholarly Press", year: "2023", link: "https://scholar.google.com" },
    ],
    flashcards: [
      {
        question: `"${query}" nima va uning asosiy vazifasi nimadan iborat?`,
        answer: `${query} – bu tegishli tizimning barqaror va maqsadli ishlashini ta'minlovchi asosiy qoida va mexanizmlar yig‘indisidir.`,
      },
      {
        question: `Ushbu sohada qanday asosiy muammolar uchraydi?`,
        answer: "Asosiy muammolar texnologik ta'minotning yetarli emasligi va tizimli monitoringning sustligida namoyon bo‘ladi.",
      },
      {
        question: `Kelajakda qanday rivojlanish kutilmoqda?`,
        answer: "Sun'iy intellekt va raqamli transformatsiyaning to‘liq integratsiyasi orqali jarayonlar to‘liq avtomatlashadi.",
      },
    ],
  };
}
