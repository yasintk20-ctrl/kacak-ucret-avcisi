# Kaçak Ücret Avcısı

Türk kullanıcılarına yönelik, PDF belge yükleyerek (kart ekstresi, telefon faturası, banka hesap ekstresi, sigorta poliçesi, diğer) unutulmuş abonelikleri ve gizli kaçak ücretleri listeleyen Next.js 14 demo uygulaması.

**Beta sürüm:** İlk 2 analiz ücretsiz. Sonrasında ücretsiz üyelik (sadece e-mail) ile sınırsız erişim.

## Teknik yığın

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Tek sayfa UI (`app/page.tsx`), state React `useState` ile
- Kullanıcı durumu (ücretsiz kullanım sayısı, üyelik) `localStorage`'da
- Email kayıt endpoint'i: `app/api/signup/route.ts` → Google Apps Script webhook → Google Sheets

## Local çalıştırma

```bash
npm install
npm run dev
```
Tarayıcıda aç: http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Deploy

- **GitHub**: [yasintk20-ctrl/kacak-ucret-avcisi](https://github.com/yasintk20-ctrl/kacak-ucret-avcisi)
- **Vercel**: kacak-ucret-avcisi.vercel.app (main branch'e push → otomatik deploy)
- **Env var**: `GOOGLE_SHEETS_WEBHOOK_URL` — Vercel Project Settings'te set edilmiş (Production + Preview)

## Google Sheets entegrasyonu

`/api/signup` endpoint'i email'i Apps Script webhook'a POST atar. Script `doPost` içinde aynı email'i duplicate olarak kontrol eder, yoksa yeni satır ekler (timestamp, email, source, userAgent, ip).
