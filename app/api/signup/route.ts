import { NextRequest, NextResponse } from "next/server";

// Next.js runtime: edge yerine node kullan (daha az kısıt)
export const runtime = "nodejs";
// Vercel bu route'u cache'lemesin — her istek gerçek zamanlı işlensin
export const dynamic = "force-dynamic";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  let body: { email?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const email = (body.email ?? "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400 }
    );
  }

  // User-agent / IP — ileride abuse analizi için faydalı
  const userAgent = req.headers.get("user-agent") ?? "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";

  const payload = {
    email,
    timestamp: new Date().toISOString(),
    userAgent,
    ip,
    source: "web",
  };

  // Webhook yoksa yine de başarılı dönelim (local dev kolaylığı)
  if (!WEBHOOK_URL) {
    console.warn(
      "[signup] GOOGLE_SHEETS_WEBHOOK_URL set değil — e-mail kaydedilmedi:",
      email
    );
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Apps Script cold-start'ı uzun olabilir
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[signup] webhook failed:", res.status, text);
      return NextResponse.json(
        { ok: false, error: "webhook_failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[signup] webhook exception:", err);
    return NextResponse.json(
      { ok: false, error: "webhook_exception" },
      { status: 502 }
    );
  }
}

// GET: sağlık kontrolü (Vercel deploy'u test ederken)
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(WEBHOOK_URL),
  });
}
