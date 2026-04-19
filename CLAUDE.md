# CLAUDE.md — Kaçak Ücret Avcısı

Bu dosya Claude (veya başka bir AI asistanı) bu klasörde çalışırken hızlıca bağlamı alsın diye yazıldı. Kullanıcı: **Yasin** (yasintk20@gmail.com), Türkçe konuşur, teknik değil — talimatlar sade ve adım adım olsun.

## Proje özeti

Türk kullanıcılar için "unutulmuş abonelik ve kaçak ücret avcısı" web app. PDF yükle → demo analiz → "şu kadar para kaçıyor" listesi.

**İş modeli (şu anki durum):** Beta. İlk 2 analiz ücretsiz, sonrası için e-mail ile ücretsiz üyelik. Amaç: mail listesi toplamak. İleride (Yasin şahıs şirketi açtığında) aylık ~₺29 paid tier'a geçilecek.

## Mimari

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Ana sayfa:** `app/page.tsx` — tek dosyada her şey: landing, dosya yükleme, demo "analyzing", results, signup wall. State React `useState` ile. Stages: `landing | analyzing | results | signup`.
- **Kalıcılık:** Kullanıcı durumu sadece `localStorage`'da:
  - `kua.freeUsed` — kaç ücretsiz analiz yaptı (2 olunca signup zorlanır)
  - `kua.memberEmail` — üye olmuşsa email
  - `kua.totalAnalyses` — toplam analiz sayısı
- **Email kaydı:** `app/api/signup/route.ts` (POST). Body'den email alır, validate eder, Google Apps Script webhook'a forward eder.
- **Backend yok:** Database Google Sheets. Webhook = Apps Script Web App.

## Google Sheets kurulumu

Mevcut Sheet: **"Kaçak Ücret Avcısı — Üye Listesi"** (Yasin'in yasintk20@gmail.com Drive'ında)
Sütunlar: `timestamp | email | source | userAgent | ip`

Apps Script kodu (Sheet'e bağlı): `doPost(e)` JSON parse → column B'de duplicate check → yoksa `appendRow`. `doGet()` health check JSON döner.

Deployed Web App URL: `https://script.google.com/macros/s/AKfycbxdNBt9RbMq3BSHhqUUsBnsxaVYacnLiRMbU2tY7hIJVJRmV9mK2gC-QDZYb7PW0wSH4g/exec`

Script güncellenirse **yeni deployment** yapılmalı (Apps Script → Dağıt → Dağıtımları Yönet → kalem → "Yeni sürüm"). URL aynı kalır.

## Deploy pipeline

- **GitHub:** `yasintk20-ctrl/kacak-ucret-avcisi` (main branch)
- **Vercel:** projesi `kacak-ucret-avcisi`, URL `kacak-ucret-avcisi.vercel.app`. GitHub auto-deploy açık.
- **Env var (Vercel):** `GOOGLE_SHEETS_WEBHOOK_URL` = yukarıdaki Apps Script URL. Production + Preview ortamlarında set. Sensitive işaretli.
- **Local klasör durumu:** ~/Desktop/kacak-ucret-avcisi — git init edilmiş olabilir (kontrol: `git status`). Değilse: `git init && git branch -M main && git remote add origin https://github.com/yasintk20-ctrl/kacak-ucret-avcisi.git`.

## Dosya haritası

```
app/
  page.tsx              # Tüm UI + state + signup akışı (~1000+ satır)
  layout.tsx            # Root layout, metadata, tr locale
  globals.css           # Tailwind imports + custom base styles
  api/signup/route.ts   # POST handler → Google Sheets webhook
next.config.mjs         # Next.js config
tailwind.config.ts      # Tailwind config
package.json            # Deps: next 14.2.15, react 18, tailwind 3.4
README.md               # Kullanıcıya yönelik açıklama
CLAUDE.md               # Bu dosya
```

## Debug ipuçları

- **Üyelik/free counter sıfırlama (canlıda):** Tarayıcı konsolu → `kuaReset()` çalıştırılır. (Fonksiyon `app/page.tsx` içinde `window` objesine eklenir.)
- **Signup hatası:** Vercel → Functions → `api/signup` log'ları. Error kodları: `invalid_json`, `invalid_email`, `webhook_failed`, `webhook_exception`.
- **Webhook URL yoksa:** `/api/signup` yine `{ ok: true, stored: false }` döner — UX kırılmaz, sadece email kaydedilmez. Log'da warning yazar.
- **Apps Script timeout:** 10 saniye. Cold-start olursa nadir fail olabilir, retry yoksa email kaybolur. Gelecekte queue + retry düşünülebilir.

## Son konuşmada kaldığımız yer

(Bu bölüm her oturum sonunda güncellenmeli)

**2026-04-19:** Paywall'ı signup wall'a çevirdik. `/api/signup` endpoint yazıldı. Google Sheet + Apps Script Web App kurulumu tamamlandı. Vercel'e `GOOGLE_SHEETS_WEBHOOK_URL` env var eklendi (Production + Preview). 

**Pending:** Yerel klasörü GitHub'a pushlayıp Vercel auto-deploy tetikleyip canlıda test etmek.

## Yasin'e çalışırken dikkat

- Türkçe konuş, kısa ve somut adımlar ver
- Terminal komutları kopyala-yapıştır olsun, tek blok halinde
- Screenshot atarsa iyi, görerek yönlendir
- "Bilal" tarzında — teknik jargon minimum, gündelik dil
- Hata çıkınca panik yapma, "çıktıyı aynen yapıştır, birlikte bakarız" de
- "₺29" gelecekte silinmez — beta bittiğinde paid tier değeri
