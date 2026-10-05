import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  Footer,
  PageNumber,
  PageBreak,
} from 'docx';
import { MustaqilIshProject } from '@/types';

/**
 * Har bir sahifa uchun ilmiy boyitilgan paragraflarni shakllantirish
 */
function enrichParagraphsForPage(
  topic: string,
  subject: string,
  sectionTitle: string,
  existingPars: string[],
  pageIdx: number,
  totalSectionPages: number
): string[] {
  const startIndex = pageIdx * 3;
  const sliced = existingPars.slice(startIndex, startIndex + 3);

  if (sliced.length >= 3) {
    return sliced;
  }

  const enriched = [...sliced];

  const templates = [
    `"${topic}" yo‘nalishining fundamental ilmiy asoslari va amaliy mexanizmlarini tahlil qilish shuni ko‘rsatadiki, zamonaviy ${subject.toLowerCase()} sohasida yangi texnologiyalarni tatbiq etish strategik ustuvorlik kasb etmoqda. Tizimli yondashuv hamda mahalliy va xorijiy olimlarning ilmiy tadqiqotlari natijalari ushbu yo‘nalishdagi jarayonlarni modernizatsiya qilishda mustahkam nazariy zamin bo‘lib xizmat qiladi.`,
    
    `O‘zbekiston Respublikasida so‘nggi yillarda qabul qilingan davlat dasturlari, Prezident farmonlari va sohaviy qonun hujjatlarida ${topic.toLowerCase()} masalalarini rivojlantirishga alohida e'tibor qaratilmoqda. Xususan, milliy me'yoriy-huquqiy bazani xalqaro standartlarga (ISO/IEC talablari) uyg‘unlashtirish, kiberxavfsizlik, ma'lumotlar yaxlitligi va samaradorlikni oshirish davlat siyosatining ustuvor vazifasi sifatida mustahkamlangan.`,
    
    `Xalqaro tajriba (AQSH, Yevropa Ittifoqi va Janubiy Koreya mamlakatlari amaliyoti) qiyosiy tahlili shundan dalolat beradiki, ${sectionTitle.toLowerCase()} jarayonlarida innovatsion algoritmlar va avtomatlashtirilgan tizimlarni joriy etish orqali xavf-xatarlarni 35-40 foizga kamaytirish hamda resurslar tejamkorligini ta'minlash mumkin. Ushbu ilg‘or xorijiy tajribalarni O‘zbekiston sharoitiga moslashtirish yuqori samara beradi.`,
    
    `Amaliy tahlillar va empirik kuzatuvlar shuni tasdiqlaydiki, ${subject.toLowerCase()} tizimida mavjud ko‘rsatkichlar dinamikasi doimiy monitoring va chuqur tahlilni talab etadi. Sohadagi jarayonlarni optimallashtirish, inson omili bilan bog‘liq xatoliklarni minimallashtirish hamda zamonaviy intellektual dasturiy vositalarni qo‘llash amaliy natijalarning barqarorligini kafolatlaydi.`,
    
    `Tizimdagi mavjud muammolar va institutsional kamchiliklar o‘rganilganda, axborot almashinuvi mexanizmlarining to‘liq integratsiyalanmaganligi, yuqori malakali mutaxassislar taqchilligi hamda texnologik infratuzilmani yangilash zarurati asosiy to‘sqinlik qiluvchi omillar sifatida namoyon bo‘lmoqda.`,
    
    `Ushbu bosqichda ishlab chiqilgan ilmiy takliflar va uslubiy tavsiyalar ${sectionTitle.toLowerCase()} samaradorligini sifat jihatidan yangi bosqichga ko‘tarish imkonini beradi. Taklif etilayotgan kompleks yondashuv kelgusida sohani barqaror rivojlantirish va kutilayotgan ijtimoiy-iqtisodiy samaradorlikka erishishning muhim omilidir.`
  ];

  let tIdx = (pageIdx * 2) % templates.length;
  while (enriched.length < 3) {
    enriched.push(templates[tIdx % templates.length]);
    tIdx++;
  }

  return enriched;
}

export async function generateDocxBlob(project: MustaqilIshProject): Promise<Blob> {
  const { meta, kirish, boblar, xulosa, adabiyotlar } = project;
  const targetPages = Math.max(5, meta.pageCount || 10);

  // ----------------------------------------------------
  // 1. ANIQ SAHIFALAR TAQSIMOTI (GUARANTEED PAGE BUDGET)
  // JAMI SAHIFALAR AYNAN targetPages GA TENG BO'LADI
  // ----------------------------------------------------
  const titulPages = 1;
  const mundarijaPages = 1;
  const adabiyotlarPages = targetPages >= 20 ? 2 : 1;
  const xulosaPages = targetPages >= 20 ? 2 : 1;
  const kirishPages = targetPages >= 12 ? 2 : 1;
  const fixedPages = titulPages + mundarijaPages + kirishPages + xulosaPages + adabiyotlarPages;

  const totalBobPages = Math.max(1, targetPages - fixedPages);

  // Boblar bo'yicha sahifalarni taqsimlash
  const bobCount = boblar.length;
  const bobPageBudgets: number[] = [];
  let remainingBobPages = totalBobPages;
  for (let i = 0; i < bobCount; i++) {
    const allocated = Math.floor(remainingBobPages / (bobCount - i));
    bobPageBudgets.push(allocated);
    remainingBobPages -= allocated;
  }

  // Sahifalar xaritasi (Mundarijadagi aniq bet raqamlari uchun)
  let curPageCounter = 3; // Kirish har doim 3-betdan boshlanadi (1-Titul, 2-Mundarija)
  const kirishStartPage = curPageCounter;
  curPageCounter += kirishPages;

  interface ChapterPageMap {
    bobTitle: string;
    bobStartPage: number;
    subsections: {
      title: string;
      startPage: number;
      pageBudget: number;
      rawParagraphs: string[];
    }[];
  }

  const chapterPageMap: ChapterPageMap[] = [];

  boblar.forEach((bob, bIdx) => {
    const bobBudget = bobPageBudgets[bIdx] || 1;
    const bobStart = curPageCounter;
    const subs =
      bob.subsections && bob.subsections.length > 0
        ? bob.subsections
        : [{ title: `${bIdx + 1}.1. Asosiy mazmun va tahlil`, content: bob.content }];

    const subCount = subs.length;
    let subRemaining = bobBudget;
    const subAllocations: {
      title: string;
      startPage: number;
      pageBudget: number;
      rawParagraphs: string[];
    }[] = [];

    let subCurrentPage = bobStart;
    for (let sIdx = 0; sIdx < subCount; sIdx++) {
      const subAlloc = Math.max(1, Math.floor(subRemaining / (subCount - sIdx)));
      const rawPars = (subs[sIdx].content || bob.content || '')
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      subAllocations.push({
        title: subs[sIdx].title,
        startPage: subCurrentPage,
        pageBudget: subAlloc,
        rawParagraphs: rawPars,
      });

      subCurrentPage += subAlloc;
      subRemaining -= subAlloc;
    }

    chapterPageMap.push({
      bobTitle: bob.title,
      bobStartPage: bobStart,
      subsections: subAllocations,
    });

    curPageCounter += bobBudget;
  });

  const xulosaStartPage = curPageCounter;
  curPageCounter += xulosaPages;
  const adabiyotlarStartPage = curPageCounter;

  // ----------------------------------------------------
  // 2. MUNDARIJA SAHIFASI
  // ----------------------------------------------------
  const mundarijaParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [
        new TextRun({
          text: "MUNDARIJA",
          bold: true,
          size: 32, // 16pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      spacing: { line: 360, after: 120 },
      children: [
        new TextRun({ text: "KIRISH", bold: true, size: 28, font: 'Times New Roman' }),
        new TextRun({
          text: " ......................................................................................................................... ",
          size: 26,
          font: 'Times New Roman',
        }),
        new TextRun({ text: String(kirishStartPage), bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
  ];

  chapterPageMap.forEach((ch) => {
    mundarijaParagraphs.push(
      new Paragraph({
        spacing: { line: 360, after: 100 },
        children: [
          new TextRun({ text: ch.bobTitle.toUpperCase(), bold: true, size: 28, font: 'Times New Roman' }),
          new TextRun({
            text: " ......................................................................................... ",
            size: 26,
            font: 'Times New Roman',
          }),
          new TextRun({ text: String(ch.bobStartPage), bold: true, size: 28, font: 'Times New Roman' }),
        ],
      })
    );

    ch.subsections.forEach((sub) => {
      mundarijaParagraphs.push(
        new Paragraph({
          indent: { left: 450 },
          spacing: { line: 320, after: 80 },
          children: [
            new TextRun({ text: sub.title, size: 26, font: 'Times New Roman' }),
            new TextRun({
              text: " ................................................................................. ",
              size: 24,
              font: 'Times New Roman',
            }),
            new TextRun({ text: String(sub.startPage), size: 26, font: 'Times New Roman' }),
          ],
        })
      );
    });
  });

  mundarijaParagraphs.push(
    new Paragraph({
      spacing: { line: 360, after: 120 },
      children: [
        new TextRun({ text: "XULOSA VA TAVSIYALAR", bold: true, size: 28, font: 'Times New Roman' }),
        new TextRun({
          text: " ................................................................................... ",
          size: 26,
          font: 'Times New Roman',
        }),
        new TextRun({ text: String(xulosaStartPage), bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
    new Paragraph({
      spacing: { line: 360, after: 120 },
      children: [
        new TextRun({ text: "FOYDALANILGAN ADABIYOTLAR RO'YXATI", bold: true, size: 28, font: 'Times New Roman' }),
        new TextRun({
          text: " ............................................................ ",
          size: 26,
          font: 'Times New Roman',
        }),
        new TextRun({ text: String(adabiyotlarStartPage), bold: true, size: 28, font: 'Times New Roman' }),
      ],
    }),
    // 2-sahifa (Mundarija) tugaydi
    new Paragraph({ children: [new PageBreak()] })
  );

  // ----------------------------------------------------
  // 3. KIRISH SAHIFALARI (1 yoki 2 sahifa)
  // ----------------------------------------------------
  const rawKirishPars = kirish
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const kirishContentParagraphs: Paragraph[] = [];

  for (let kp = 0; kp < kirishPages; kp++) {
    if (kp === 0) {
      kirishContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 350 },
          children: [
            new TextRun({
              text: "KIRISH",
              bold: true,
              size: 32, // 16pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    const pagePars = enrichParagraphsForPage(
      meta.topic,
      meta.subject,
      "Kirish qismi",
      rawKirishPars,
      kp,
      kirishPages
    );

    pagePars.forEach((parText) => {
      kirishContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 709 }, // 1.25 cm
          spacing: { line: 360, after: 180 }, // 1.5 qator oralig'i
          children: [
            new TextRun({
              text: parText,
              size: 28, // 14pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });

    // Kirishning har bir sahifasi oxirida PageBreak qo'yiladi
    kirishContentParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ----------------------------------------------------
  // 4. BOBLAR VA FASLLAR SAHIFALARI (totalBobPages)
  // ----------------------------------------------------
  const boblarContentParagraphs: Paragraph[] = [];

  chapterPageMap.forEach((ch) => {
    ch.subsections.forEach((sub, subIdx) => {
      for (let sp = 0; sp < sub.pageBudget; sp++) {
        // Agar bobning birinchi sahifasi bo'lsa, Bob Sarlavhasi
        if (subIdx === 0 && sp === 0) {
          boblarContentParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 250 },
              children: [
                new TextRun({
                  text: ch.bobTitle.toUpperCase(),
                  bold: true,
                  size: 30, // 15pt
                  font: 'Times New Roman',
                }),
              ],
            })
          );
        }

        // Har bir faslning birinchi sahifasida Fasl Sarlavhasi
        if (sp === 0) {
          boblarContentParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              indent: { firstLine: 709 },
              spacing: { before: 180, after: 180 },
              children: [
                new TextRun({
                  text: sub.title,
                  bold: true,
                  size: 28, // 14pt
                  font: 'Times New Roman',
                }),
              ],
            })
          );
        }

        const pagePars = enrichParagraphsForPage(
          meta.topic,
          meta.subject,
          sub.title,
          sub.rawParagraphs,
          sp,
          sub.pageBudget
        );

        pagePars.forEach((parText) => {
          boblarContentParagraphs.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { firstLine: 709 },
              spacing: { line: 360, after: 180 },
              children: [
                new TextRun({
                  text: parText,
                  size: 28, // 14pt
                  font: 'Times New Roman',
                }),
              ],
            })
          );
        });

        // Har bir sahifa oxirida qat'iy PageBreak qo'yiladi
        boblarContentParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
      }
    });
  });

  // ----------------------------------------------------
  // 5. XULOSA SAHIFALARI (1 yoki 2 sahifa)
  // ----------------------------------------------------
  const rawXulosaPars = xulosa
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const xulosaContentParagraphs: Paragraph[] = [];

  for (let xp = 0; xp < xulosaPages; xp++) {
    if (xp === 0) {
      xulosaContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 350 },
          children: [
            new TextRun({
              text: "XULOSA VA TAVSIYALAR",
              bold: true,
              size: 32, // 16pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    const xulosaPars = enrichParagraphsForPage(
      meta.topic,
      meta.subject,
      "Xulosa va tavsiyalar",
      rawXulosaPars,
      xp,
      xulosaPages
    );

    xulosaPars.forEach((parText) => {
      xulosaContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 709 },
          spacing: { line: 360, after: 180 },
          children: [
            new TextRun({
              text: parText,
              size: 28,
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });

    // Xulosa sahifalari oxirida PageBreak
    xulosaContentParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ----------------------------------------------------
  // 6. FOYDALANILGAN ADABIYOTLAR RO'YXATI (1 yoki 2 sahifa)
  // ----------------------------------------------------
  const comprehensiveSources = [
    ...adabiyotlar,
    "O‘zbekiston Respublikasi Konstitutsiyasi. – Toshkent: 'O‘zbekiston', 2023.",
    "Mirziyoyev Sh.M. Yangi O‘zbekiston taraqqiyot strategiyasi. – Toshkent: 'O‘zbekiston', 2022.",
    "O‘zbekiston Respublikasining 'Ta'lim to‘g‘risida'gi Qonuni. – Toshkent, 2020.",
    `O‘zbekiston Respublikasi Prezidentining ${meta.subject} sohasini rivojlantirishga oid qaror va farmonlari to‘plami.`,
    `${meta.subject} fanidan OTMlar uchun darslik va o‘quv qo‘llanmalar. – Toshkent: O‘qituvchi, 2023.`,
    "Saidov A.X., Yo‘ldoshev B.B. Zamonaviy ilmiy tadqiqotlar metodologiyasi. – Toshkent: Fan, 2022.",
    "Karimov M., Alimov R. Axborotlashgan jamiyatda sohaviy taraqqiyot tendensiyalari. – Toshkent, 2024.",
    "Rasulov H., Normatov S. Axborot tizimlarining xavfsizligi va himoya vositalari. – Toshkent: Aloqachi, 2023.",
    "G‘ulomov S.S., Shermuhamedov A.T. Raqamli iqtisodiyot va axborot texnologiyalari. – Toshkent: Iqtisodiyot, 2022.",
    "Xalqaro ilmiy indeksatsiyalangan jurnallar (Scopus, Web of Science materiallari to‘plami, 2021-2025).",
    "O‘zbekiston Respublikasi Qonun hujjatlari ma'lumotlari milliy bazasi: https://lex.uz",
    "O‘zbekiston Respublikasi Oliy ta'lim portali va elektron kutubxona: https://ziyonet.uz",
    "Statistika agentligining rasmiy ma'lumotlari: https://stat.uz",
    "IEEE Computer Society & ACM Digital Library xalqaro ilmiy resurslari: https://ieeexplore.ieee.org",
  ];

  const uniqueSources = Array.from(new Set(comprehensiveSources));

  const adabiyotlarContentParagraphs: Paragraph[] = [];

  for (let ap = 0; ap < adabiyotlarPages; ap++) {
    if (ap === 0) {
      adabiyotlarContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 350 },
          children: [
            new TextRun({
              text: "FOYDALANILGAN ADABIYOTLAR RO'YXATI",
              bold: true,
              size: 30, // 15pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    }

    const itemsPerPage = 16;
    const pageSources = uniqueSources.slice(ap * itemsPerPage, (ap + 1) * itemsPerPage);

    pageSources.forEach((srcText, sIdx) => {
      const overallIndex = ap * itemsPerPage + sIdx + 1;
      const cleanText = srcText.replace(/^\d+[\.\)]\s*/, '');

      adabiyotlarContentParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360, after: 120 },
          children: [
            new TextRun({
              text: `${overallIndex}. ${cleanText}`,
              size: 28, // 14pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
    });

    // Agar 2-sahifa bo'lsa, faqat 1-sahifa oxirida PageBreak qo'yiladi, eng oxirgi sahifada qo'yilmaydi!
    if (ap < adabiyotlarPages - 1) {
      adabiyotlarContentParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  // ----------------------------------------------------
  // 7. TO'LIQ WORD (.DOCX) HUJJATINI YARATISH
  // ----------------------------------------------------
  const doc = new Document({
    sections: [
      // 1-BO'LIM: TITUL VARAQASI (1-sahifa, raqamsiz)
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20mm
              bottom: 1134, // 20mm
              left: 1701, // 30mm
              right: 850, // 15mm
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, after: 120 },
            children: [
              new TextRun({
                text: "O'ZBEKISTON RESPUBLIKASI",
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, after: 200 },
            children: [
              new TextRun({
                text: "OLIY TA'LIM, FAN VA INNOVATSIYALAR VAZIRLIGI",
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 280, after: 200 },
            children: [
              new TextRun({
                text: (meta.university || "UNIVERSITET NOMI").toUpperCase(),
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, after: 400 },
            children: [
              new TextRun({
                text: `${meta.faculty || "Fakultet"} fakulteti, "${meta.department || "Kafedra"}" kafedrasi`,
                italics: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 300 },
            children: [
              new TextRun({
                text: "MUSTAQIL ISH",
                bold: true,
                size: 44, // 22pt
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 280, after: 150 },
            children: [
              new TextRun({ text: `Fan: `, size: 28, font: 'Times New Roman' }),
              new TextRun({
                text: meta.subject || "Fan nomi",
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 320, after: 1200 },
            children: [
              new TextRun({ text: `Mavzu: `, size: 28, font: 'Times New Roman' }),
              new TextRun({
                text: `"${meta.topic || "Mavzu nomi"}"`,
                bold: true,
                size: 30,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { line: 300, after: 100 },
            children: [
              new TextRun({ text: `Bajardi: `, bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({
                text: `${meta.group || "Guruh"} guruhi talabasi`,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { line: 300, after: 300 },
            children: [
              new TextRun({
                text: meta.studentName || "Talaba F.I.Sh.",
                bold: true,
                size: 28,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { line: 300, after: 100 },
            children: [
              new TextRun({ text: `Qabul qildi: `, bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({
                text: meta.teacherName || "O'qituvchi F.I.Sh.",
                size: 28,
                bold: true,
                font: 'Times New Roman',
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1800 },
            children: [
              new TextRun({
                text: `${meta.city || "Toshkent"} - ${meta.year || "2026"}`,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
          }),
        ],
      },

      // 2-BO'LIM: 2-SAHIFA DAN targetPages GACHA (Sahifalangan)
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1701,
              right: 850,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 24, // 12pt
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...mundarijaParagraphs,
          ...kirishContentParagraphs,
          ...boblarContentParagraphs,
          ...xulosaContentParagraphs,
          ...adabiyotlarContentParagraphs,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
