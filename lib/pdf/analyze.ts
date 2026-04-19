/* ============================================================
   Analyzer — extracted PDF text üzerinde pattern matching
   ------------------------------------------------------------
   1) PDF'ten metin çıkar
   2) Tanıdık marka patternlarını tara (lowercase substring)
   3) Her eşleşmenin yakınında TR tutar formatı bul
   4) Bulguları birleştir, tahmini yıllık tasarruf hesapla
   ============================================================ */

import { SUBSCRIPTION_BRANDS, type BrandPattern } from "./subscriptions";
import { extractTextFromPdf } from "./extract";

/* ============================================================
   Ortak tipler (page.tsx ile paylaşılır)
   ============================================================ */
export type PdfKind = "kart" | "fatura" | "banka" | "polise" | "diger";
export type FindingType = "cancel" | "review" | "warning" | "keep" | "info";

export interface Finding {
  icon: string;
  name: string;
  type: FindingType;
  description: string;
  amount?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface AnalysisResult {
  kind: PdfKind;
  totalSavings: number;
  findings: Finding[];
}

/* ============================================================
   Tutar parse — TR ("1.234,56") ve EN ("1,234.56") destekli
   ============================================================ */
function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const lastDot = raw.lastIndexOf(".");
  const lastComma = raw.lastIndexOf(",");
  const lastSep = Math.max(lastDot, lastComma);

  if (lastSep === -1) {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }

  const afterSepLen = raw.length - lastSep - 1;
  if (afterSepLen === 1 || afterSepLen === 2) {
    // Son ayraç ondalık
    const intPart = raw.slice(0, lastSep).replace(/[.,]/g, "");
    const decPart = raw.slice(lastSep + 1);
    const n = parseFloat(intPart + "." + decPart);
    return Number.isFinite(n) ? n : null;
  }

  // Tüm ayraçlar thousand separator
  const n = parseInt(raw.replace(/[.,]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

/* ============================================================
   Tutar regex — ondalık zorunlu (kart ekstrelerinde hep var)
   ============================================================ */
const AMOUNT_RE = /(?<!\d)\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})(?!\d)/g;

function findNearestAmount(
  text: string,
  pos: number,
  patLen: number
): number | null {
  // Önce markanın SAĞINDA ara (ekstrelerde tutar merchant'tan sonra gelir)
  const fwdStart = pos + patLen;
  const fwdEnd = Math.min(text.length, fwdStart + 200);
  const fwdChunk = text.slice(fwdStart, fwdEnd);
  const fwd = fwdChunk.match(AMOUNT_RE);
  if (fwd && fwd.length > 0) {
    const parsed = parseAmount(fwd[0]);
    if (parsed !== null && parsed > 0 && parsed < 100000) return parsed;
  }

  // Bulamadıysan solda dene
  const backStart = Math.max(0, pos - 80);
  const backChunk = text.slice(backStart, pos);
  const back = backChunk.match(AMOUNT_RE);
  if (back && back.length > 0) {
    const parsed = parseAmount(back[back.length - 1]);
    if (parsed !== null && parsed > 0 && parsed < 100000) return parsed;
  }

  return null;
}

/* ============================================================
   Pattern matching
   ============================================================ */
interface Detection {
  brand: BrandPattern;
  amounts: number[];
  occurrences: number;
}

function scanBrands(text: string): Detection[] {
  const lower = text.toLowerCase();
  const byKey = new Map<string, Detection>();

  for (const brand of SUBSCRIPTION_BRANDS) {
    for (const pat of brand.patterns) {
      const needle = pat.toLowerCase();
      let from = 0;
      while (true) {
        const idx = lower.indexOf(needle, from);
        if (idx === -1) break;

        let det = byKey.get(brand.key);
        if (!det) {
          det = { brand, amounts: [], occurrences: 0 };
          byKey.set(brand.key, det);
        }
        det.occurrences += 1;

        const amount = findNearestAmount(lower, idx, needle.length);
        if (amount !== null) det.amounts.push(amount);

        from = idx + needle.length;
      }
    }
  }

  return Array.from(byKey.values());
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function formatTRY(n: number): string {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   Bulguları Finding listesine çevir
   ============================================================ */
function buildFindings(detections: Detection[]): Finding[] {
  return detections
    .map((d) => {
      const monthly = median(d.amounts);
      const recurring = d.occurrences >= 2;

      const description = recurring
        ? `Bu belgede ${d.occurrences} kez görünüyor — tekrar eden ödeme gibi duruyor. Hâlâ kullanıyor musun?`
        : monthly
        ? `Ekstrede tespit ettik. Kullanmıyorsan iptal zamanı olabilir.`
        : `Ekstrede bu markanın imzasını gördük. Tutar çıkaramadık ama kontrol etmeye değer.`;

      const amount =
        monthly !== null
          ? `₺${formatTRY(monthly)} / aylık`
          : undefined;

      return {
        icon: d.brand.icon,
        name: d.brand.name,
        type: "review" as FindingType,
        description,
        amount,
        actionLabel: d.brand.cancelUrl ? "Yönet / iptal et" : undefined,
        actionUrl: d.brand.cancelUrl,
        _monthly: monthly ?? 0,
        _occurrences: d.occurrences,
      };
    })
    .sort((a: any, b: any) => b._monthly - a._monthly)
    .map(({ _monthly, _occurrences, ...rest }: any) => rest as Finding);
}

function estimateYearly(detections: Detection[]): number {
  return detections.reduce((sum, d) => {
    const m = median(d.amounts);
    return sum + (m ?? 0) * 12;
  }, 0);
}

/* ============================================================
   Özel durum: kart/banka dışı PDF türleri
   ============================================================ */
function nonCardResult(kind: PdfKind): AnalysisResult {
  const msg: Record<Exclude<PdfKind, "kart" | "banka">, Finding> = {
    fatura: {
      icon: "🚧",
      name: "Fatura analizi yakında",
      type: "info",
      description:
        "Şu an otomatik tarama kart ve banka ekstrelerinde çalışıyor. Telefon/internet faturaları için AI destekli derin analiz yolda — beta üyelerine açılacak.",
    },
    polise: {
      icon: "🚧",
      name: "Poliçe analizi yakında",
      type: "info",
      description:
        "Sigorta poliçesi analizi (prim artışı, çifte sigorta, kapsam karşılaştırması) için yapay zekâ modülünü geliştiriyoruz. Üye olursan hazır olunca ilk sen haberdar olacaksın.",
    },
    diger: {
      icon: "🔎",
      name: "PDF türünü tanıyamadık",
      type: "info",
      description:
        "Belgenin türünü belirleyemedik. En iyi sonucu kredi kartı ekstresi ya da banka hesap ekstresi ile alıyoruz. Son 1–3 ayın ekstresini yükleyip tekrar dene.",
    },
  };
  return {
    kind,
    totalSavings: 0,
    findings: [msg[kind as Exclude<PdfKind, "kart" | "banka">]],
  };
}

/* ============================================================
   Metin çok az / okunamıyor
   ============================================================ */
function unreadableResult(kind: PdfKind): AnalysisResult {
  return {
    kind,
    totalSavings: 0,
    findings: [
      {
        icon: "⚠️",
        name: "PDF'ten yeterli metin çıkaramadık",
        type: "warning",
        description:
          "Bu PDF taranmış (görüntü) olabilir ya da metin kilitli olabilir. Bankandan 'metin kopyalanabilir' PDF ekstresi iste ve tekrar yükle.",
      },
    ],
  };
}

/* ============================================================
   Kart/banka için abonelik bulunamadı
   ============================================================ */
function noMatchResult(kind: PdfKind, textLen: number): AnalysisResult {
  return {
    kind,
    totalSavings: 0,
    findings: [
      {
        icon: "✅",
        name: "Tanıdık bir abonelik bulunamadı",
        type: "keep",
        description: `Belgede ${textLen.toLocaleString(
          "tr-TR"
        )} karakter metin tarandı ama tanıdığımız 60+ marka aboneliğinden hiçbiri tespit edilmedi. Listede olmayan özel bir abonelik varsa AI destekli derin analiz ile yakalayabiliyoruz (yakında).`,
      },
    ],
  };
}

/* ============================================================
   Ana fonksiyon — page.tsx bunu çağırır
   ============================================================ */
export async function analyzePdf(
  file: File,
  kind: PdfKind
): Promise<AnalysisResult> {
  // Kart/banka dışı türler için şimdilik pattern matching anlamsız
  if (kind !== "kart" && kind !== "banka") {
    return nonCardResult(kind);
  }

  let text = "";
  try {
    text = await extractTextFromPdf(file);
  } catch (err) {
    console.warn("PDF metin çıkarma hatası:", err);
    return unreadableResult(kind);
  }

  if (!text || text.replace(/\s+/g, "").length < 80) {
    return unreadableResult(kind);
  }

  const detections = scanBrands(text);
  if (detections.length === 0) {
    return noMatchResult(kind, text.length);
  }

  return {
    kind,
    totalSavings: Math.round(estimateYearly(detections)),
    findings: buildFindings(detections),
  };
}
