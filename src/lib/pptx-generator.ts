import { PresentationProject, PresentationStyle } from '@/types';

const STYLE_PALETTES: Record<
  PresentationStyle,
  {
    bg: string;
    cardBg: string;
    titleColor: string;
    textColor: string;
    accent: string;
    subtextColor: string;
  }
> = {
  'modern-dark': {
    bg: '0B0F19',
    cardBg: '161F30',
    titleColor: 'F8FAFC',
    textColor: 'CBD5E1',
    accent: '4F46E5', // Indigo
    subtextColor: '94A3B8',
  },
  'academic-blue': {
    bg: '0F172A',
    cardBg: '1E293B',
    titleColor: 'FFFFFF',
    textColor: 'E2E8F0',
    accent: '0284C7', // Sky blue
    subtextColor: '94A3B8',
  },
  'minimal-light': {
    bg: 'F8FAFC',
    cardBg: 'FFFFFF',
    titleColor: '0F172A',
    textColor: '334155',
    accent: '2563EB', // Blue
    subtextColor: '64748B',
  },
  'emerald-green': {
    bg: '064E3B',
    cardBg: '065F46',
    titleColor: 'ECFDF5',
    textColor: 'D1FAE5',
    accent: '10B981', // Emerald
    subtextColor: 'A7F3D0',
  },
  'creative-purple': {
    bg: '2E1065',
    cardBg: '3B0764',
    titleColor: 'FAF5FF',
    textColor: 'F3E8FF',
    accent: 'A855F7', // Purple
    subtextColor: 'D8B4FE',
  },
};

export async function exportToPptx(project: PresentationProject): Promise<void> {
  const pptxModule = await import('pptxgenjs');
  const PptxGen = (pptxModule.default || pptxModule) as any;
  const pptx = new PptxGen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = project.title;

  const palette = STYLE_PALETTES[project.style] || STYLE_PALETTES['modern-dark'];

  // Har bir slaydni generatsiya qilish
  project.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();

    // Fon rangi
    slide.background = { color: palette.bg };

    const isFirstSlide = index === 0;

    if (isFirstSlide) {
      // 1. TITUL SLAYDI (Gamma uslubi)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 5.9,
        fill: { color: palette.cardBg },
        line: { color: palette.accent, width: 2 },
      });

      // Accent dekorativ chiziq
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.4,
        y: 1.5,
        w: 1.2,
        h: 0.12,
        fill: { color: palette.accent },
      });

      // Katta sarlavha
      slide.addText(slideData.title, {
        x: 1.4,
        y: 1.8,
        w: 10.5,
        h: 1.8,
        fontSize: 38,
        bold: true,
        color: palette.titleColor,
        fontFace: 'Arial',
        valign: 'top',
        wrap: true,
      });

      // Subtitle / Tavsif
      if (slideData.subtitle || slideData.bullets[0]) {
        slide.addText(slideData.subtitle || slideData.bullets[0], {
          x: 1.4,
          y: 3.7,
          w: 10.5,
          h: 1.2,
          fontSize: 18,
          color: palette.subtextColor,
          fontFace: 'Arial',
          wrap: true,
        });
      }

      // TalabaAI belgisi
      slide.addText(`Tayyorladi: TalabaAI Taqdimot Tizimi | ${new Date().getFullYear()}`, {
        x: 1.4,
        y: 5.6,
        w: 10.5,
        h: 0.5,
        fontSize: 12,
        color: palette.accent,
        fontFace: 'Arial',
      });
    } else {
      // 2. KONTENT SLAYDLARI
      // Yuqori header
      slide.addText(`SLAYD ${String(index + 1).padStart(2, '0')} / ${String(project.slides.length).padStart(2, '0')}`, {
        x: 0.8,
        y: 0.5,
        w: 4.0,
        h: 0.4,
        fontSize: 11,
        bold: true,
        color: palette.accent,
        fontFace: 'Arial',
      });

      // Slayd sarlavhasi
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.9,
        w: 11.5,
        h: 0.9,
        fontSize: 26,
        bold: true,
        color: palette.titleColor,
        fontFace: 'Arial',
      });

      // Chiziq
      slide.addShape(pptx.ShapeType.line, {
        x: 0.8,
        y: 1.85,
        w: 11.7,
        h: 0,
        line: { color: palette.accent, width: 1 },
      });

      // Asosiy kontent - 2 ta blok yoki bitta katta blok
      const hasHighlightOrStats = Boolean(slideData.highlight || slideData.stats);
      const bulletsWidth = hasHighlightOrStats ? 7.2 : 11.7;

      // Punktlar (Bullets)
      const bulletItems = slideData.bullets.map((b) => ({
        text: `•  ${b}\n\n`,
        options: {
          fontSize: 16,
          color: palette.textColor,
          fontFace: 'Arial',
          breakLine: true,
        },
      }));

      slide.addText(bulletItems, {
        x: 0.8,
        y: 2.1,
        w: bulletsWidth,
        h: 4.5,
        valign: 'top',
        wrap: true,
      });

      // O'ng tarafdagi Rasm va Highlight / Stat karta
      if (slideData.imageUrl) {
        try {
          slide.addImage({
            path: slideData.imageUrl,
            x: 8.2,
            y: 2.1,
            w: 4.3,
            h: 2.4,
            sizing: { type: 'cover', w: 4.3, h: 2.4 },
          });
        } catch (imgErr) {
          console.warn('PPTX image error:', imgErr);
        }
      }

      if (hasHighlightOrStats) {
        const cardY = slideData.imageUrl ? 4.7 : 2.1;
        const cardH = slideData.imageUrl ? 2.0 : 4.5;

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 8.2,
          y: cardY,
          w: 4.3,
          h: cardH,
          fill: { color: palette.cardBg },
          line: { color: palette.accent, width: 1.5 },
          rectRadius: 0.2,
        });

        if (slideData.stats && !slideData.imageUrl) {
          slide.addText(slideData.stats.value, {
            x: 8.4,
            y: 2.4,
            w: 3.9,
            h: 1.0,
            fontSize: 34,
            bold: true,
            color: palette.accent,
            fontFace: 'Arial',
            align: 'center',
          });

          slide.addText(slideData.stats.label, {
            x: 8.4,
            y: 3.4,
            w: 3.9,
            h: 0.8,
            fontSize: 14,
            color: palette.subtextColor,
            fontFace: 'Arial',
            align: 'center',
          });
        }

        if (slideData.highlight) {
          slide.addText(`💡 ASOSIY XULOSA`, {
            x: 8.4,
            y: slideData.imageUrl ? 4.85 : (slideData.stats ? 4.2 : 2.5),
            w: 3.9,
            h: 0.35,
            fontSize: 11,
            bold: true,
            color: palette.accent,
            fontFace: 'Arial',
          });

          slide.addText(slideData.highlight, {
            x: 8.4,
            y: slideData.imageUrl ? 5.2 : (slideData.stats ? 4.6 : 3.0),
            w: 3.9,
            h: slideData.imageUrl ? 1.3 : 1.8,
            fontSize: slideData.imageUrl ? 12 : 14,
            italic: true,
            color: palette.textColor,
            fontFace: 'Arial',
            wrap: true,
          });
        }
      }

      // Pastki footer
      slide.addText(`${project.title} | TalabaAI`, {
        x: 0.8,
        y: 6.9,
        w: 11.7,
        h: 0.4,
        fontSize: 10,
        color: palette.subtextColor,
        fontFace: 'Arial',
      });
    }
  });

  const safeFileName = `${project.title.replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, '_').substring(0, 35)}.pptx`;
  await pptx.writeFile({ fileName: safeFileName });
}
