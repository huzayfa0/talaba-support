import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  ImageRun,
} from 'docx';
import { ObyektivkaData } from '@/types';

/**
 * Base64 tasvirni Uint8Array ga o'tkazish
 */
function base64ToUint8Array(base64: string): Uint8Array | null {
  try {
    const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(pureBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error('Base64 tasvirni o‘qishda xatolik:', err);
    return null;
  }
}

/**
 * Rasmiy O'zbekiston standarti bo'yicha Obyektivka (.docx) faylini yaratish
 */
export async function generateObyektivkaDocxBlob(data: ObyektivkaData): Promise<Blob> {
  const font = 'Times New Roman';
  const tableBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: '000000',
  };

  const bordersAll = {
    top: tableBorder,
    bottom: tableBorder,
    left: tableBorder,
    right: tableBorder,
    insideHorizontal: tableBorder,
    insideVertical: tableBorder,
  };

  // 1. Tepa qism: 3x4 Rasm va Sarlavha
  let imageRunElement: ImageRun | null = null;
  if (data.photoUrl && data.photoUrl.startsWith('data:image')) {
    const imageBytes = base64ToUint8Array(data.photoUrl);
    if (imageBytes) {
      const isJpg = data.photoUrl.includes('image/jpeg') || data.photoUrl.includes('image/jpg');
      imageRunElement = new ImageRun({
        type: isJpg ? 'jpg' : 'png',
        data: imageBytes,
        transformation: {
          width: 115,
          height: 150,
        },
      });
    }
  }

  // Tepa sarlavha va rasm jadvali (border ko'rinmaydi)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'MA’LUMOTNOMA',
                    bold: true,
                    size: 28, // 14pt
                    font,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 140 },
                children: [
                  new TextRun({
                    text: data.fish || 'Abdullayev Sardor Rustamovich',
                    bold: true,
                    size: 28, // 14pt
                    font,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 180 },
                children: [
                  new TextRun({
                    text: data.joriyLavozim || 'Talaba',
                    bold: true,
                    size: 22, // 11pt
                    font,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: imageRunElement
                  ? [imageRunElement]
                  : [
                      new TextRun({
                        text: '[ 3x4 Rasm ]',
                        italics: true,
                        size: 18,
                        font,
                      }),
                    ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2. Asosiy ko'rsatkichlar jadvali (2 ustunli)
  const detailsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Tug‘ilgan yili:\t', font, bold: false }),
                  new TextRun({ text: data.tugilganSana || '—', font, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Tug‘ilgan joyi:\t', font, bold: false }),
                  new TextRun({ text: data.tugilganJoyi || '—', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Millati:\t', font }),
                  new TextRun({ text: data.millati || 'O‘zbek', font, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Partiyaviyligi:\t', font }),
                  new TextRun({ text: data.partiyaviyligi || 'Yo‘q', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Ma’lumoti:\t', font }),
                  new TextRun({ text: data.malumoti || 'Tugallanmagan oliy (Talaba)', font, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Tamomlagan:\t', font }),
                  new TextRun({ text: data.tamomlagan || '—', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Ma’lumoti bo‘yicha mutaxassisligi:\t', font }),
                  new TextRun({ text: data.mutaxassisligi || '—', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Ilmiy darajasi:\t', font }),
                  new TextRun({ text: data.ilmiyDaraja || 'Yo‘q', font, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Ilmiy unvoni:\t', font }),
                  new TextRun({ text: data.ilmiyUnvon || 'Yo‘q', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Qaysi chet tillarini biladi:\t', font }),
                  new TextRun({ text: data.chetTillari || 'Rus tili, Ingliz tili', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: 'Davlat mukofotlari bilan taqdirlanganmi:\t', font }),
                  new TextRun({ text: data.davlatMukofotlari || 'Taqdirlanmagan', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            children: [
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'Xalq deputatlari respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a’zosimi:\t',
                    font,
                  }),
                  new TextRun({ text: data.deputatlik || 'Yo‘q', font, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 3. Mehnat faoliyati
  const mehnatRows: Paragraph[] = [];
  mehnatRows.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 140 },
      children: [
        new TextRun({
          text: 'MEHNAT FAOLIYATI',
          bold: true,
          size: 26, // 13pt
          font,
        }),
      ],
    })
  );

  if (data.mehnatFaoliyati && data.mehnatFaoliyati.length > 0) {
    data.mehnatFaoliyati.forEach((item) => {
      mehnatRows.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `${item.yillar} — `, bold: true, font }),
            new TextRun({ text: item.lavozim, font }),
          ],
        })
      );
    });
  } else {
    mehnatRows.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: '2024 y. - h.v. — OTM talabasi', font })],
      })
    );
  }

  // 4. Yaqin qarindoshlari haqida ma'lumot jadvali
  const qarindoshTitle = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 140 },
    children: [
      new TextRun({
        text: `${data.fish || 'Abdullayev Sardor Rustamovich'}ning yaqin qarindoshlari haqida\nMA’LUMOT`,
        bold: true,
        size: 26, // 13pt
        font,
      }),
    ],
  });

  // Jadval qatorlari
  const qarindoshTableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Qarindoshligi', bold: true, font, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 26, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Familiyasi, ismi va otasining ismi', bold: true, font, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Tug‘ilgan yili va joyi', bold: true, font, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Ish joyi va lavozimi', bold: true, font, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Turar joyi', bold: true, font, size: 20 })],
            }),
          ],
        }),
      ],
    }),
  ];

  if (data.qarindoshlar && data.qarindoshlar.length > 0) {
    data.qarindoshlar.forEach((q) => {
      qarindoshTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: q.qarindoshligi, font, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: q.fish, font, bold: true, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: q.tugilganYiliVaJoyi, font, size: 20 })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: q.vafotEtgan ? `${q.ishJoyiVaLavozimi || ''} (vafot etgan)` : q.ishJoyiVaLavozimi || '—',
                      font,
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: q.turarJoyi || '—', font, size: 20 })],
                }),
              ],
            }),
          ],
        })
      );
    });
  }

  const qarindoshTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: bordersAll,
    rows: qarindoshTableRows,
  });

  // Hujjatni yig'ish
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 2 cm
              bottom: 1134, // 2 cm
              left: 1417, // 2.5 cm
              right: 850, // 1.5 cm
            },
          },
        },
        children: [
          headerTable,
          new Paragraph({ spacing: { after: 120 } }),
          detailsTable,
          ...mehnatRows,
          qarindoshTitle,
          qarindoshTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
