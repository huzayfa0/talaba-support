// mavzular bo'yicha yuqori sifatli zaxira rasmlar (Unsplash)
const THEME_IMAGES: Record<string, string[]> = {
  history: [
    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80', // Samarkand Registan
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1000&q=80', // Ancient book and compass
    'https://images.unsplash.com/photo-1599732488812-70b556b27d81?auto=format&fit=crop&w=1000&q=80', // Historical architecture
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80', // Classical painting / art
  ],
  linux: [
    'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1000&q=80', // Linux terminal
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80', // Matrix code
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80', // Server hardware
  ],
  cyber: [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80', // Cyber lock
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80', // Cyber security room
    'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1000&q=80', // Digital security
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80', // AI humanoid
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', // Neural gradient
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', // Chip circuit
  ],
  economy: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80', // Financial chart
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80', // Trading desk
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80', // Business skyscrapers
  ],
  ecology: [
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1000&q=80', // Solar panels
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80', // Wind turbines
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1000&q=80', // Green forest
  ],
  general: [
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80', // Education books
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80', // Studying student
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80', // Modern workspace
  ],
};

// Wikipedia Commons dan aniq rasmni qidirish (Tarixiy obidalar, mashhur insonlar, ilmiy atamalar uchun)
export async function searchWikiImage(query: string): Promise<string | null> {
  if (!query || query.trim().length < 2) return null;

  try {
    const cleanQuery = query
      .replace(/^(kirish|xulosa|asosiy|1-bob|2-bob|3-bob|slayd)\s*[:\-]?\s*/gi, '')
      .replace(/[\"\'\(\)\:\,]/g, '')
      .trim();

    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=1&prop=pageimages&pithumbsize=900&format=json&origin=*`;

    const res = await fetch(url, { headers: { 'User-Agent': 'TalabaAI/1.0' } });
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
      if (page.thumbnail?.source) {
        return page.thumbnail.source;
      }
    }
  } catch (e) {
    // Tarmoq xatosi bo'lsa, zaxiraga o'tadi
    console.warn('Wiki image fetch xatosi:', e);
  }
  return null;
}

// Har bir slayd uchun mos rasm topish
export async function resolveSlideImage(
  topic: string,
  slideTitle: string,
  imageKeywords?: string,
  slideIndex: number = 0
): Promise<string> {
  // 1. Agar AI maxsus qidiruv kalit so'zi bergan bo'lsa yoki slayd sarlavhasi bo'yicha Wiki dan qidirish
  const searchQueries = [
    imageKeywords,
    slideTitle,
    topic,
  ].filter(Boolean) as string[];

  for (const q of searchQueries) {
    const wikiImg = await searchWikiImage(q);
    if (wikiImg) {
      return wikiImg;
    }
  }

  // 2. Mavzuga qarab tematik Unsplash rasmlari
  const lower = `${topic} ${slideTitle} ${imageKeywords || ''}`.toLowerCase();

  let category = 'general';
  if (lower.includes('tarix') || lower.includes('o\'zbekiston') || lower.includes('samarqand') || lower.includes('buxoro') || lower.includes('temur') || lower.includes('navoiy')) {
    category = 'history';
  } else if (lower.includes('linux') || lower.includes('linus') || lower.includes('unix') || lower.includes('ubuntu') || lower.includes('dastur') || lower.includes('kod')) {
    category = 'linux';
  } else if (lower.includes('kiber') || lower.includes('xavfsiz') || lower.includes('hujum') || lower.includes('firewall') || lower.includes('vpn') || lower.includes('shifr')) {
    category = 'cyber';
  } else if (lower.includes('sun\'iy') || lower.includes('intellekt') || lower.includes('ai') || lower.includes('neyron') || lower.includes('robot')) {
    category = 'ai';
  } else if (lower.includes('iqtisod') || lower.includes('moliya') || lower.includes('bank') || lower.includes('biznes') || lower.includes('investitsiya')) {
    category = 'economy';
  } else if (lower.includes('yashil') || lower.includes('energiya') || lower.includes('quyosh') || lower.includes('ekologiya') || lower.includes('shamol')) {
    category = 'ecology';
  }

  const pool = THEME_IMAGES[category] || THEME_IMAGES['general'];
  return pool[slideIndex % pool.length];
}
