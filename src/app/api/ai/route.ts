import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey: clientApiKey } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt kiritilmadi' }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API kalit topilmadi. Iltimos, sozlamalardan Gemini API kalitini kiriting.' },
        { status: 400 }
      );
    }

    // Google Gemini 3.8 Flash (eng so'nggi va tezkor model)
    const model = 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let response: Response | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            thinkingConfig: {
              thinkingBudget: 1024,
            },
          },
        }),
      });

      if (response.ok || (response.status !== 503 && response.status !== 429)) {
        break;
      }

      console.warn(`Gemini API ${response.status} qaytardi. ${attempts}-urinishdan so'ng 1.5s kutilmoqda...`);
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : { error: { message: 'Serverga ulanib bo‘lmadi' } };
      return NextResponse.json(
        { error: errorData.error?.message || 'Gemini API so‘rovida xatolik yuz berdi' },
        { status: response ? response.status : 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ text: generatedText });
  } catch (error: unknown) {
    console.error('AI API error:', error);
    const message = error instanceof Error ? error.message : 'Serverda ichki xatolik yuz berdi';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
