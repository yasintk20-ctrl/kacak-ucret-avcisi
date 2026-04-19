"use client";

import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";

/* ============================================================
   Tipler
   ============================================================ */
type PdfKind = "kart" | "fatura" | "banka" | "polise" | "diger";
type Stage = "landing" | "analyzing" | "results" | "signup";
type FindingType = "cancel" | "review" | "warning" | "keep" | "info";

interface Finding {
  icon: string;
  name: string;
  type: FindingType;
  description: string;
  amount?: string; // "₺249,99 / aylık" vb.
  actionLabel?: string;
  actionUrl?: string;
}

interface AnalysisResult {
  kind: PdfKind;
  totalSavings: number;
  findings: Finding[];
}

/* ============================================================
   PDF Türü Tanımları (Landing kartları)
   ============================================================ */
const PDF_KINDS: {
  key: PdfKind;
  emoji: string;
  title: string;
  sub: string;
}[] = [
  {
    key: "kart",
    emoji: "💳",
    title: "Kredi Kartı Ekstresi",
    sub: "Abonelikler, tekrar eden ödemeler",
  },
  {
    key: "fatura",
    emoji: "📱",
    title: "Telefon / İnternet Faturası",
    sub: "Gizli ücretler, paket dışı",
  },
  {
    key: "banka",
    emoji: "🏦",
    title: "Banka Hesap Ekstresi",
    sub: "Otomatik talimatlar, hesap masrafları",
  },
  {
    key: "polise",
    emoji: "🛡️",
    title: "Sigorta Poliçesi",
    sub: "Kapsam, fiyat karşılaştırma",
  },
  {
    key: "diger",
    emoji: "📄",
    title: "Diğer PDF",
    sub: "Ne varsa yükle, biz bakarız",
  },
];

/* ============================================================
   Demo Bulgular
   ============================================================ */
function generateFindings(kind: PdfKind): AnalysisResult {
  switch (kind) {
    case "kart":
      return {
        kind,
        totalSavings: 4356,
        findings: [
          {
            icon: "🎬",
            name: "Netflix Premium",
            type: "review",
            description:
              "Premium plan — aile hesabı kullanmıyorsan Standart plana düşebilirsin.",
            amount: "₺249,99 / aylık",
            actionLabel: "Planı düşür",
            actionUrl: "https://www.netflix.com/youraccount",
          },
          {
            icon: "📺",
            name: "Exxen",
            type: "cancel",
            description: "Son 3 aydır hiç izlenmemiş görünüyor.",
            amount: "₺79,90 / aylık",
            actionLabel: "İptal et",
            actionUrl: "https://www.exxen.com/hesap/abonelik",
          },
          {
            icon: "🎥",
            name: "BluTV",
            type: "cancel",
            description:
              "Çifte aboneliğin var: Netflix + BluTV. İçerikler büyük ölçüde örtüşüyor.",
            amount: "₺89,90 / aylık",
            actionLabel: "İptal et",
            actionUrl: "https://www.blutv.com/hesap",
          },
          {
            icon: "☁️",
            name: "iCloud+ 200 GB",
            type: "review",
            description:
              "Aile Paylaşımı aktif olsa kişi başı maliyetin neredeyse sıfıra iner.",
            amount: "₺29,99 / aylık",
            actionLabel: "Plan değiştir",
            actionUrl: "https://www.icloud.com/settings",
          },
          {
            icon: "🤖",
            name: "ChatGPT Plus",
            type: "review",
            description:
              "Son 30 günde ortalama 2 sorgu/gün — ücretsiz sürüm yetebilir.",
            amount: "≈ ₺650 / aylık",
            actionLabel: "Kullanımı incele",
            actionUrl: "https://chat.openai.com/#settings/Subscription",
          },
          {
            icon: "🦉",
            name: "Duolingo Super",
            type: "cancel",
            description: "40 günlük streak kırılmış, uygulama 2 ay açılmamış.",
            amount: "₺59,90 / aylık",
            actionLabel: "İptal et",
            actionUrl: "https://www.duolingo.com/settings/subscription",
          },
          {
            icon: "🎧",
            name: "Spotify Premium",
            type: "keep",
            description:
              "Her gün ortalama 2 saat dinleme — fiyat/performans iyi.",
            amount: "₺59,99 / aylık",
          },
        ],
      };

    case "fatura":
      return {
        kind,
        totalSavings: 2124,
        findings: [
          {
            icon: "☎️",
            name: "Özel Hat Servisi",
            type: "cancel",
            description:
              "Kampanya bitmiş, otomatik olarak aylık ücretli hizmete döndürülmüş.",
            amount: "₺39,90 / aylık",
            actionLabel: "Operatörü ara",
          },
          {
            icon: "✉️",
            name: "Ekstra SMS Paketi",
            type: "cancel",
            description: "Son 6 ayda paket kotanın %4'ü kullanılmış.",
            amount: "₺19,90 / aylık",
            actionLabel: "İptal et",
          },
          {
            icon: "📺",
            name: "Dijital TV Ekstra Paket",
            type: "review",
            description:
              "Ekstra spor/belgesel paketi — kullanım verisi zayıf.",
            amount: "₺49,00 / aylık",
            actionLabel: "Paketi incele",
          },
          {
            icon: "⚠️",
            name: "Gecikme Faizi",
            type: "warning",
            description:
              "Geçen dönem ödeme 3 gün gecikmiş. Otomatik ödemeye geçmek bunu sıfırlar.",
            amount: "₺18,45 / tek sefer",
            actionLabel: "Otomatik ödeme kur",
          },
          {
            icon: "🎁",
            name: "Sadakat Kampanyası",
            type: "review",
            description:
              "Kampanya indirim hakkın kullanılmamış görünüyor.",
            amount: "≈ ₺78,00 / aylık fayda",
            actionLabel: "Kampanyaya başvur",
          },
        ],
      };

    case "banka":
      return {
        kind,
        totalSavings: 1680,
        findings: [
          {
            icon: "💳",
            name: "Kredi Kartı Yıllık Aidatı",
            type: "review",
            description:
              "Çağrı merkezini arayıp iptal talep edersen büyük ihtimalle düşürüyorlar.",
            amount: "₺650,00 / yıllık",
            actionLabel: "Bankayı ara",
          },
          {
            icon: "🏦",
            name: "Hesap İşletim Ücreti",
            type: "warning",
            description:
              "Çeyrek dönemlik masraf — rakip bankalarda aynı hizmet ücretsiz.",
            amount: "₺180,00 / 3 ayda bir",
            actionLabel: "Karşılaştır",
          },
          {
            icon: "🏋️",
            name: "SMART SPOR — Eski Otomatik Talimat",
            type: "cancel",
            description:
              "2 yıl önce iptal ettiğin spor salonundan çekim devam ediyor.",
            amount: "₺149,00 / aylık",
            actionLabel: "Talimatı iptal et",
          },
          {
            icon: "💸",
            name: "Havale / EFT Komisyonu",
            type: "review",
            description:
              "Aynı bankadan yapılsa sıfır, dijital kanallarda sıfır olması lazım.",
            amount: "₺49,50 / tek sefer",
            actionLabel: "Dijitalden yap",
          },
          {
            icon: "🏠",
            name: "Konut Sigortası (DASK dışı)",
            type: "cancel",
            description:
              "Aynı ev için başka bir poliçede de kapsamın var — çifte sigorta.",
            amount: "₺45,00 / aylık",
            actionLabel: "İptal et",
          },
        ],
      };

    case "polise":
      return {
        kind,
        totalSavings: 3200,
        findings: [
          {
            icon: "📈",
            name: "Geçen Yıla Göre Zam",
            type: "warning",
            description:
              "Prim %78 artmış, piyasa ortalaması %35. Yenilemeden önce teklif topla.",
            amount: "+ ₺2.400,00 / yıllık fark",
            actionLabel: "Teklif karşılaştır",
          },
          {
            icon: "🦷",
            name: "Kapsam Dışı: Diş Tedavisi",
            type: "review",
            description:
              "Diş paketi poliçede yok — ayrı ek paket daha ucuza gelebilir.",
            amount: "≈ ₺600,00 / yıllık",
            actionLabel: "Ek paket sor",
          },
          {
            icon: "🩺",
            name: "Check-up Hakkı",
            type: "info",
            description:
              "Yılda 1 kez ücretsiz check-up hakkın var, bu yıl kullanılmamış.",
            actionLabel: "Randevu al",
          },
          {
            icon: "🏷️",
            name: "Rakip Fiyatı",
            type: "review",
            description:
              "Aynı kapsama sahip 3 rakip poliçe ortalaması daha düşük.",
            amount: "≈ ₺800,00 / yıllık tasarruf",
            actionLabel: "Karşılaştır",
          },
        ],
      };

    case "diger":
    default:
      return {
        kind: "diger",
        totalSavings: 1250,
        findings: [
          {
            icon: "🔎",
            name: "PDF Türü Belirsiz",
            type: "info",
            description:
              "Belgeyi tanıyamadık. Daha iyi analiz için kredi kartı ekstresi ya da telefon faturası yüklemeyi dene.",
            actionLabel: "Yeniden yükle",
          },
          {
            icon: "💡",
            name: "Genel Tavsiye",
            type: "info",
            description:
              "Son 3 ayın kart ekstrelerini birlikte yüklersen tekrar eden abonelikleri %90 doğrulukla tespit ediyoruz.",
          },
        ],
      };
  }
}

/* ============================================================
   Type → rozet etiket ve renk
   ============================================================ */
const typeBadge: Record<
  FindingType,
  { label: string; className: string; barClass: string }
> = {
  cancel: {
    label: "Kaçak",
    className: "bg-red-500/15 text-red-300 border border-red-400/30",
    barClass: "bar-cancel",
  },
  review: {
    label: "İncele",
    className:
      "bg-yellow-400/15 text-yellow-300 border border-yellow-300/30",
    barClass: "bar-review",
  },
  warning: {
    label: "Dikkat",
    className:
      "bg-orange-400/15 text-orange-300 border border-orange-300/30",
    barClass: "bar-warning",
  },
  keep: {
    label: "Tamam",
    className:
      "bg-green-400/15 text-green-300 border border-green-300/30",
    barClass: "bar-keep",
  },
  info: {
    label: "Bilgi",
    className:
      "bg-violet-400/15 text-violet-300 border border-violet-300/30",
    barClass: "bar-info",
  },
};

/* ============================================================
   Helpers
   ============================================================ */
const FREE_LIMIT = 2;
const COUNTER_KEY = "kua.totalAnalyses";
const FREE_USED_KEY = "kua.freeUsed";
const MEMBER_EMAIL_KEY = "kua.memberEmail";
const BASE_COUNT = 1247;

function formatTRY(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

/* ============================================================
   Ana Bileşen
   ============================================================ */
export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [selectedKind, setSelectedKind] = useState<PdfKind | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // localStorage state
  const [totalCount, setTotalCount] = useState<number>(BASE_COUNT);
  const [freeUsed, setFreeUsed] = useState<number>(0);
  const [memberEmail, setMemberEmail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mount: localStorage'dan yükle
  useEffect(() => {
    try {
      const rawCount = window.localStorage.getItem(COUNTER_KEY);
      const rawFree = window.localStorage.getItem(FREE_USED_KEY);
      const rawMember = window.localStorage.getItem(MEMBER_EMAIL_KEY);
      setTotalCount(rawCount ? parseInt(rawCount, 10) : BASE_COUNT);
      setFreeUsed(rawFree ? parseInt(rawFree, 10) : 0);
      setMemberEmail(rawMember || null);
    } catch {
      // localStorage yoksa sessiz geç
    }
    setHydrated(true);
  }, []);

  const isMember = Boolean(memberEmail);
  const freeRemaining = isMember
    ? Infinity
    : Math.max(0, FREE_LIMIT - freeUsed);

  /* Kart tıklama → file picker aç */
  const handleKindClick = (kind: PdfKind) => {
    if (!isMember && freeRemaining <= 0) {
      setStage("signup");
      return;
    }
    setSelectedKind(kind);
    // küçük gecikme: state güncellendikten sonra picker aç
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  /* Üyelik başarılı → state güncelle, landing'e dön */
  const handleSignupSuccess = (email: string) => {
    try {
      window.localStorage.setItem(MEMBER_EMAIL_KEY, email);
    } catch {}
    setMemberEmail(email);
    setStage("landing");
  };

  /* Dosya seçildi → analiz başlat */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset (aynı dosyayı tekrar seçebilmek için)
    if (!file || !selectedKind) return;
    startAnalysis(selectedKind);
  };

  const startAnalysis = (kind: PdfKind) => {
    setStage("analyzing");
    setAnalyzingStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setAnalyzingStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => {
          const r = generateFindings(kind);
          setResult(r);
          // localStorage güncelle — üyeler için freeUsed artırmıyoruz
          const newCount = totalCount + 1;
          const newFree = isMember ? freeUsed : freeUsed + 1;
          try {
            window.localStorage.setItem(COUNTER_KEY, String(newCount));
            if (!isMember) {
              window.localStorage.setItem(FREE_USED_KEY, String(newFree));
            }
          } catch {}
          setTotalCount(newCount);
          setFreeUsed(newFree);
          setStage("results");
        }, 400);
      }
    }, 650);
  };

  const goLanding = () => {
    setStage("landing");
    setResult(null);
    setSelectedKind(null);
  };

  const goSignup = () => setStage("signup");

  /* Dev kolaylığı: sayaç + üyeliği sıfırla (sadece konsoldan) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).kuaReset = () => {
      window.localStorage.removeItem(COUNTER_KEY);
      window.localStorage.removeItem(FREE_USED_KEY);
      window.localStorage.removeItem(MEMBER_EMAIL_KEY);
      window.location.reload();
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Arka plan parıltıları */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      {/* Gizli dosya inputu */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
        {/* Üst bar: logo + sayaç */}
        <header className="flex items-center justify-between mb-10 fade-up">
          <button
            onClick={goLanding}
            className="flex items-center gap-2 text-left"
            aria-label="Ana sayfa"
          >
            <span className="text-2xl">🎯</span>
            <span className="font-display font-bold text-xl tracking-tight">
              Kaçak Ücret Avcısı
            </span>
          </button>

          {hydrated && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-400/30 text-red-200 text-xs sm:text-sm font-medium">
              <span className="pulse-dot w-2 h-2 rounded-full bg-red-400" />
              {formatTRY(totalCount)} kaçak bulundu
            </div>
          )}
        </header>

        {stage === "landing" && (
          <LandingView
            freeRemaining={freeRemaining}
            isMember={isMember}
            onKindClick={handleKindClick}
          />
        )}

        {stage === "analyzing" && (
          <AnalyzingView step={analyzingStep} />
        )}

        {stage === "results" && result && (
          <ResultsView
            result={result}
            freeRemaining={freeRemaining}
            isMember={isMember}
            onNew={goLanding}
            onSignup={goSignup}
          />
        )}

        {stage === "signup" && (
          <SignupView
            onBack={goLanding}
            onSuccess={handleSignupSuccess}
          />
        )}

        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Kaçak Ücret Avcısı · Beta sürüm ·
          Üyelik şu an ücretsiz
        </footer>
      </div>
    </main>
  );
}

/* ============================================================
   LANDING
   ============================================================ */
function LandingView({
  freeRemaining,
  isMember,
  onKindClick,
}: {
  freeRemaining: number;
  isMember: boolean;
  onKindClick: (k: PdfKind) => void;
}) {
  return (
    <section>
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto fade-up">
        <h1 className="display-title text-4xl sm:text-6xl md:text-7xl leading-[1.02]">
          Faturanda, ekstrende, sözleşmende{" "}
          <span className="shine-text">kaçak ücret</span> var mı?
        </h1>
        <p className="mt-6 text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
          PDF'ini yükle — 30 saniyede unutulmuş abonelikleri, gizli komisyonları
          ve eski otomatik talimatları bul. Türkçe, basit, net.
        </p>

        {isMember ? (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-200 text-sm fade-up delay-1">
            <span>⭐</span>
            Üyesin · sınırsız analiz
          </div>
        ) : (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/30 text-green-300 text-sm fade-up delay-1">
            <span>✓</span>
            İlk {FREE_LIMIT} analiz tamamen ücretsiz · Kayıt gerekmiyor
            {freeRemaining < FREE_LIMIT && freeRemaining > 0 && (
              <span className="text-green-200/80">
                · kalan hak: {freeRemaining}
              </span>
            )}
          </div>
        )}
      </div>

      {/* PDF Türü kartları */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PDF_KINDS.map((k, i) => (
          <button
            key={k.key}
            onClick={() => onKindClick(k.key)}
            className={`glass-card glass-card-hover text-left p-6 fade-up delay-${
              Math.min(i + 1, 5)
            }`}
          >
            <div className="text-4xl mb-3">{k.emoji}</div>
            <div className="font-display font-bold text-xl mb-1">
              {k.title}
            </div>
            <div className="text-white/60 text-sm">{k.sub}</div>
            <div className="mt-4 text-amber-300/90 text-sm font-medium">
              PDF yükle →
            </div>
          </button>
        ))}
      </div>

      {/* Güven bloğu */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🔒",
            title: "PDF 24 saatte silinir",
            sub: "Belgelerin analiz sonrası otomatik olarak kalıcı silinir.",
          },
          {
            icon: "⚡",
            title: "30 saniyede sonuç",
            sub: "Yapay zeka ile hızlı tarama, anında rapor.",
          },
          {
            icon: "💳",
            title: "Banka şifresi yok",
            sub: "Sadece PDF yüklüyorsun. Hesabına erişim istemiyoruz.",
          },
        ].map((b, i) => (
          <div
            key={b.title}
            className={`glass-card p-5 fade-up delay-${Math.min(i + 1, 5)}`}
          >
            <div className="text-2xl mb-2">{b.icon}</div>
            <div className="font-semibold mb-1">{b.title}</div>
            <div className="text-white/55 text-sm">{b.sub}</div>
          </div>
        ))}
      </div>

      {/* Nasıl çalışır */}
      <div className="mt-16 fade-up">
        <h2 className="display-title text-2xl sm:text-3xl mb-6">
          Nasıl çalışır?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              n: "01",
              t: "PDF'ini yükle",
              s: "Kart ekstresi, fatura, banka özeti — ne varsa.",
            },
            {
              n: "02",
              t: "Sistem tarar",
              s: "Aboneliği, komisyonu, eski talimatı saniyeler içinde bulur.",
            },
            {
              n: "03",
              t: "Raporu oku",
              s: "Her bulgu için net açıklama ve tavsiye.",
            },
            {
              n: "04",
              t: "Kurtar",
              s: "İptal linklerine tıkla, parayı geri kazan.",
            },
          ].map((s, i) => (
            <div
              key={s.n}
              className={`glass-card p-5 fade-up delay-${Math.min(i + 1, 5)}`}
            >
              <div className="font-display text-amber-300/90 text-sm">
                {s.n}
              </div>
              <div className="font-semibold text-lg mt-1">{s.t}</div>
              <div className="text-white/55 text-sm mt-1">{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ANALYZING
   ============================================================ */
function AnalyzingView({ step }: { step: number }) {
  const steps = [
    "PDF okunuyor",
    "Metin çıkarılıyor",
    "Kalemler sınıflandırılıyor",
    "Anomaliler taranıyor",
    "Rapor hazırlanıyor",
  ];

  return (
    <section className="flex items-center justify-center py-10 fade-up">
      <div className="glass-card gold-glow p-8 sm:p-10 w-full max-w-xl text-center">
        <div className="text-5xl mb-4 slow-spin">🔍</div>
        <h2 className="display-title text-2xl sm:text-3xl mb-2">
          PDF'in taranıyor
        </h2>
        <p className="text-white/60 text-sm mb-6">
          Birkaç saniye sürer — sonuçlar hazırlanıyor.
        </p>

        <ul className="text-left space-y-3">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={s}
                className={`flex items-center gap-3 transition-opacity ${
                  done || active ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    done
                      ? "bg-gold-gradient text-[#1a1147]"
                      : active
                      ? "border border-amber-300 text-amber-300"
                      : "border border-white/20 text-white/40"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-sm sm:text-base ${
                    active ? "text-amber-200" : "text-white/80"
                  }`}
                >
                  {s}
                  {active && <span className="ml-1 opacity-60">…</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   RESULTS
   ============================================================ */
function ResultsView({
  result,
  freeRemaining,
  isMember,
  onNew,
  onSignup,
}: {
  result: AnalysisResult;
  freeRemaining: number;
  isMember: boolean;
  onNew: () => void;
  onSignup: () => void;
}) {
  return (
    <section className="space-y-6">
      {/* Özet */}
      <div className="glass-card gold-glow p-8 sm:p-10 text-center fade-up">
        <div className="text-sm uppercase tracking-widest text-amber-300/80">
          Analiz Özeti
        </div>
        <div className="mt-3 display-title text-4xl sm:text-6xl">
          Yılda kurtarabileceğin{" "}
          <span className="shine-text">
            ₺{formatTRY(result.totalSavings)}
          </span>
        </div>
        <div className="mt-3 text-white/65">
          {result.findings.length} kalem bulundu · {" "}
          {result.findings.filter((f) => f.type === "cancel").length} net
          kaçak, {" "}
          {result.findings.filter((f) => f.type === "review").length} incelenecek
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={onNew} className="btn-outline">
            Yeni PDF yükle
          </button>
        </div>
      </div>

      {/* Bulgular listesi */}
      <div className="space-y-3">
        {result.findings.map((f, i) => {
          const badge = typeBadge[f.type];
          return (
            <div
              key={i}
              className={`glass-card ${badge.barClass} p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center fade-up delay-${
                Math.min(i + 1, 5)
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="font-semibold text-lg">{f.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-2 text-white/65 text-sm">{f.description}</p>
                {f.amount && (
                  <div className="mt-2 text-amber-300 font-semibold text-sm">
                    {f.amount}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                {f.actionUrl ? (
                  <a
                    href={f.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold inline-block text-sm"
                  >
                    {f.actionLabel ?? "Aç"} →
                  </a>
                ) : f.actionLabel ? (
                  <div className="text-white/70 text-sm italic">
                    {f.actionLabel}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt: hak kaldı mı */}
      {isMember ? (
        <div className="glass-card p-5 sm:p-6 border border-amber-400/30 bg-amber-400/5 fade-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div className="flex-1">
              <div className="font-semibold">
                Üyesin — sınırsız analiz hakkın var
              </div>
              <div className="text-white/60 text-sm">
                İstediğin kadar PDF yükleyip kurtarmaya devam edebilirsin.
              </div>
            </div>
            <button onClick={onNew} className="btn-outline">
              Yeni PDF
            </button>
          </div>
        </div>
      ) : freeRemaining > 0 ? (
        <div className="glass-card p-5 sm:p-6 border border-green-400/30 bg-green-400/5 fade-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
              <div className="font-semibold">
                {freeRemaining} ücretsiz analiz hakkın daha var
              </div>
              <div className="text-white/60 text-sm">
                Başka bir PDF yükle, belki daha çok kurtaracak.
              </div>
            </div>
            <button onClick={onNew} className="btn-outline">
              Yeni PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card gold-glow gold-border p-6 sm:p-8 text-center fade-up">
          <div className="text-3xl mb-2">⭐</div>
          <div className="display-title text-2xl sm:text-3xl mb-2">
            Sınırsız için üye ol — ücretsiz
          </div>
          <div className="text-white/65 text-sm max-w-md mx-auto">
            E-mail bırakmak yeterli. Beta dönemde hiçbir ücret yok,
            sınırsız PDF analizi, yeni özelliklerden ilk sen haberdar ol.
          </div>
          <button
            onClick={onSignup}
            className="btn-gold mt-5 inline-block text-base"
          >
            Ücretsiz üye ol →
          </button>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   SIGNUP (ücretsiz üyelik duvarı)
   ============================================================ */
function SignupView({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const features = [
    "Sınırsız PDF analizi",
    "Yeni özelliklerden ilk sen haberdar ol",
    "Beta dönemde tamamen ücretsiz",
    "İstediğin zaman çıkış",
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      setError("Geçerli bir e-mail adresi gir.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        throw new Error("Sunucu hatası");
      }
      onSuccess(trimmed);
    } catch (err) {
      // Backend bağlı değilse bile üyeliği local'de tutuyoruz ki kullanıcı sıkışmasın
      console.warn("Signup endpoint başarısız, yerel üyelik veriliyor:", err);
      onSuccess(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-6 fade-up">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-3">⭐</div>
        <h2 className="display-title text-4xl sm:text-6xl">
          <span className="shine-text">Ücretsiz üye ol</span>,
          <br className="sm:hidden" /> sınırsız kullan
        </h2>
        <p className="mt-4 text-white/65">
          İlk 2 analiz bitti — güzel başladık. Beta dönemindeyiz,
          üyelik şimdilik tamamen ücretsiz. Sadece e-mailin yeter.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Form kartı */}
        <div className="glass-card gold-glow gold-border p-8">
          <div className="text-sm uppercase tracking-widest text-amber-300/80">
            Ücretsiz Üyelik · Beta
          </div>
          <div className="mt-3 display-title text-5xl">
            ₺0 <span className="text-white/50 text-xl">/ şimdilik</span>
          </div>
          <div className="mt-2 text-white/60 text-sm">
            Kart bilgisi yok · taahhüt yok · iptal gerekmiyor.
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-white/75 text-sm mb-2">
              E-mail adresin
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="ornek@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-amber-300/60 focus:bg-white/[0.07] transition"
              required
            />
            {error && (
              <div className="mt-2 text-red-300 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold mt-4 w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor…" : "Ücretsiz üye ol →"}
            </button>
          </form>

          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <span className="text-amber-300">✓</span>
                <span className="text-white/85">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-white/45 text-xs">
            E-mail ile spam yapmıyoruz. Sadece büyük güncellemelerde yazacağız.
          </div>
        </div>

        {/* Sağ taraf: güven + SSS */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="font-semibold mb-2">Neden e-mail istiyorsunuz?</div>
            <p className="text-white/60 text-sm">
              Hâlâ betadayız ve ürünü geliştiriyoruz. Üye olursan yeni
              özelliklerden, PDF okuma kalitesinin artışından ilk sen
              haberdar olursun.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="font-semibold mb-2">İleride para alacak mısınız?</div>
            <p className="text-white/60 text-sm">
              Beta bitince aylık bir ücret olacak (₺29 civarı). Ama şu anki
              üyelere ilk dönem için özel indirim yapacağız — erken gelene
              kredi var.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="font-semibold mb-2">Verilerim güvende mi?</div>
            <p className="text-white/60 text-sm">
              E-mailini sadece güncelleme göndermek için kullanıyoruz,
              üçüncü taraflarla paylaşmıyoruz. İstediğin zaman çıkabilirsin.
            </p>
          </div>

          <button onClick={onBack} className="btn-outline w-full">
            ← Geri dön
          </button>
        </div>
      </div>
    </section>
  );
}
