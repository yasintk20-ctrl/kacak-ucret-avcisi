# CLAUDE.md — Kaçak Ücret Avcısı

Bu dosya Claude (veya başka bir AI asistanı) bu klasörde çalışırken hızlıca bağlamı alsın diye yazıldı. Kullanıcı: **Yasin** (yasintk20@gmail.com), Türkçe konuşur, teknik değil — talimatlar sade ve adım adım olsun.

## Proje özeti

Türk kullanıcılar için "unutulmuş abonelik ve kaçak ücret avcısı" web app. PDF yükle → **gerçek pattern-matching analizi** → "şu kadar para kaçıyor" listesi.

**İş modeli (şu anki durum):** Beta. İlk 2 analiz ücretsiz, sonrası için e-mail ile ücretsiz üyelik. Amaç: mail listesi toplamak. İleride (Yasin şahıs şirketi açtığında) aylık ~₺29 paid tier'a geçilecek.

## Mimari

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Ana sayfa:** `app/page.tsx` — UI + state + signup akışı. State React `useState` ile. Stages: `landing | analyzing | results | signup`.
- **PDF analyzer:** `lib/pdf/` — tarayıcıda çalışan pattern matching. Sunucuya PDF gitmiyor.
- **Kalıcılık:** Kullanıcı durumu sadece `localStorage`'da:
  - `kua.freeUsed` — kaç ücretsiz analiz yaptı (2 olunca signup zorlanır)
  - `kua.memberEmail` — üye olmuşsa email
  - `kua.totalAnalyses` — toplam analiz sayısı
- **Email kaydı:** `app/api/signup/route.ts` (POST). Body'den email alır, validate eder, Google Apps Script webhook'a forward eder.
- **Backend yok:** Database Google Sheets. Webhook = Apps Script Web App.

## PDF Analiz Pipeline

Kullanıcı PDF yüklediğinde:
1. `lib/pdf/extract.ts` — **pdfjs-dist v3.11.174'ü jsdelivr CDN'den** script tag ile yükler (npm dep yok). ArrayBuffer → metin.
2. `lib/pdf/analyze.ts` — `scanBrands(text)` lowercase substring tarar. Her eşleşme civarında (fwd 200 char, back 80 char) TR tutar regex'i çalıştırır: `/(?<!\d)\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})(?!\d)/`. Median ile aylık tahmin, ×12 yıllık.
3. `lib/pdf/subscriptions.ts` — 60+ marka kataloğu. Her marka: `key, name, icon, patterns[] (lowercase substring), cancelUrl?`.

**Sadece `kart` ve `banka` PDF türlerinde gerçek tarama çalışır.** `fatura/polise/diger` için dürüst "yakında" mesajı dönüyor (daha önceki fake yerine).

**Edge case'ler:**
- Taranmış/görüntü PDF (metin 80 char altı) → "PDF okunamadı" uyarısı
- Tanıdık marka yok → "tanıdık abonelik bulunamadı, AI derin analiz yakında"
- CDN erişilemezse (pdfjs yüklenmez) → catch'e düşer, "analiz başarısız" UX

**Animasyon timing:** `startAnalysis` gerçek analiz + 3.4s minimum animasyon paralel. Hangisi uzunsa ona göre bekler.

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
- **Local klasör durumu:** `~/Desktop/kacak-ucret-avcisi` — git kurulu, remote `origin` GitHub'a bağlı, main upstream set. `git push` direkt çalışır.
- **GitHub auth:** 2026-04-19'da Personal Access Token ile macOS Keychain'e kaydedildi. Token expiration 90 gün (2026-07-18 civarı yenilemek gerekecek). Yasin'in reflexi "Username'e token yapıştırmak" — dikkat edip **Username'in `yasintk20-ctrl` olduğunu** hatırlatmak gerek, token sadece Password'e.

## Dosya haritası

```
app/
  page.tsx              # UI + state + signup akışı (~840 satır, fake data'dan arındırıldı)
  layout.tsx            # Root layout, metadata, tr locale
  globals.css           # Tailwind imports + custom base styles
  api/signup/route.ts   # POST handler → Google Sheets webhook
lib/
  pdf/
    extract.ts          # pdfjs CDN yükler + PDF → text (browser-side)
    subscriptions.ts    # 60+ marka pattern kataloğu (Netflix, Spotify, Apple vb.)
    analyze.ts          # Pattern matching + TR tutar parser + result builder
next.config.mjs         # Next.js config
tailwind.config.ts      # Tailwind config
package.json            # Deps: next 14.2.15, react 18, tailwind 3.4 (pdfjs CDN'den)
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

**2026-04-19 (oturum 2):** Fake `generateFindings` (~230 satır sahte veri) silindi, yerine **gerçek PDF analizi** geldi. pdfjs-dist CDN'den yükleniyor (npm dep yok), 60+ marka kataloğu, TR tutar parser. Commit `71b8269` main'e push edildi. Canlıda test edildi: Yasin'in kendi ekstresinde Apple aboneliği (₺399,99/ay) doğru yakalandı.

**Yasin'in yeni isteği (pending, başlanmadı):** Sadece abonelik listesi yetmez, **harcama dökümü** de göster. İstediği:
1. Aynı merchantları topla: "Migros · 8 kez · ₺4.200"
2. Top 10 merchant listesi
3. **Banka komisyonları ayrı bölüm** (HAVALE, AIDAT, İŞLETİM, FAİZ) — bunlar net kaçak, abonelikten daha öfkelendirici
4. Kategori dağılımı (market/yemek/akaryakıt/alışveriş yüzdeleri)
5. Abonelikler ayrı bölüm olarak kalır
6. Üst özet: "Bu dönem toplam ₺X, en çok Migros'a (₺X)"
7. Kategorize edilemeyen harcamalar için "AI derin analiz yakında" hook (üyelik teşviki)

**Planlanan teknik yaklaşım:**
- `subscriptions.ts` → `merchants.ts` olarak genişlet (veya `category` field ekle)
- ~150 marka katalogu: market (Migros/BİM/A101/Şok/CarrefourSA), akaryakıt (BP/Shell/Opet/Total), yemek (Starbucks/Burger King/Domino's + Yemeksepeti/Getir Yemek), alışveriş (Trendyol/Hepsiburada/LCW/Koton/Zara), fatura (BEDAŞ/İSKİ/İGDAŞ/Turkcell/Vodafone), eczane/sağlık
- Banka komisyonları generic keyword: HAVALE, EFT, İŞLETİM, AIDAT, KART ÜCRETİ, GECİKME FAİZİ, KOMİSYON
- Analyzer `DetectedMerchant { brand, category, occurrences, totalAmount, averageAmount }` dönsün
- UI 4 bölüm: Özet / Abonelikler / Banka komisyonları / Top merchantlar (+ opsiyonel kategori bar)
- Tahmini süre: 3-4 saat

**Olası zayıflık:** Satır satır tutar eşleştirmesi (şu anki regex) %90 başarılı. Farklı ekstrelerde iki işlem iç içe geçmiş formatlarda hata olabilir — gerçek ekstrelerle ince ayar gerekecek. İlk test Yasin'in kendi PDF'i ile yap.

## Yasin'e çalışırken dikkat

- Türkçe konuş, kısa ve somut adımlar ver
- Terminal komutları kopyala-yapıştır olsun, tek blok halinde
- Screenshot atarsa iyi, görerek yönlendir
- "Bilal" tarzında — teknik jargon minimum, gündelik dil
- Hata çıkınca panik yapma, "çıktıyı aynen yapıştır, birlikte bakarız" de
- "₺29" gelecekte silinmez — beta bittiğinde paid tier değeri
- **Fake/demo veri ASLA gösterme** — Yasin bu konuda net: "fake sonuç gören kimse üye olmaz, intihar olur". Gerçek veriyle çalışmıyorsa dürüstçe "yakında" de, uydurma sonuç üretme.
- **GUI > terminal** — auth, git gibi işlerde terminal Yasin için zor. GitHub Desktop gibi GUI önerisi onu daha az yorar. Screenshot'ta hassas veri (token, şifre) görünce hemen iptal ettir.
- **Push'tan önce onay al** — `git push` destructive olmayan ama shared state değişimi. "sen yap" gibi net onay varsa yap; yoksa sor.
