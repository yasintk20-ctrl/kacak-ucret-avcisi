import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaçak Ücret Avcısı — Faturanda gizli kaçak var mı?",
  description:
    "PDF'ini yükle, 30 saniyede unutulmuş abonelikleri ve gizli kaçak ücretleri bul. İlk 2 analiz ücretsiz.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-app-gradient text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
