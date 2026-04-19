/* ============================================================
   PDF metin çıkarma — pdfjs CDN'den yüklenir, browser'da çalışır
   ------------------------------------------------------------
   npm bağımlılığı yok, Next.js bundle'ına eklenmiyor.
   Kullanıcı PDF yüklediğinde CDN'den pdfjs çekilip metin
   tarayıcının içinde çıkarılır. Sunucu hiç görmez.
   ============================================================ */

const PDFJS_VERSION = "3.11.174";
const PDFJS_MAIN = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build/pdf.min.js`;
const PDFJS_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build/pdf.worker.min.js`;

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { data: ArrayBuffer }) => {
        promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<{
            getTextContent: () => Promise<{
              items: Array<{ str: string }>;
            }>;
          }>;
        }>;
      };
      version?: string;
    };
  }
}

let loadPromise: Promise<void> | null = null;

function loadPdfjs(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("pdfjs sadece tarayıcıda çalışır"));
      return;
    }

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PDFJS_MAIN}"]`
    );

    const onReady = () => {
      if (!window.pdfjsLib) {
        reject(new Error("pdfjs yüklendi ama global bulunamadı"));
        return;
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve();
    };

    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () =>
        reject(new Error("pdfjs CDN yüklenemedi"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = PDFJS_MAIN;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("pdfjs CDN yüklenemedi"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  await loadPdfjs();
  if (!window.pdfjsLib) throw new Error("pdfjs hazır değil");

  const buffer = await file.arrayBuffer();
  const doc = await window.pdfjsLib.getDocument({ data: buffer }).promise;

  const parts: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => (it && typeof it.str === "string" ? it.str : ""))
      .join(" ");
    parts.push(pageText);
  }

  return parts.join("\n");
}
