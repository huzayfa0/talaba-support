import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "TalabaAI — Slaydlar (Gamma) va Mustaqil Ish Generatori",
  description: "Talabalar uchun Gamma.app uslubida taqdimotlar tayyorlash, O‘zbekiston OTMlari standarti bo‘yicha 'Mustaqil ish' generatsiyasi va ilmiy qidiruv platformasi.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
