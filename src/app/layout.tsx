import type { Metadata } from "next";
import { Barlow_Condensed, Nunito } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const kurdis = localFont({
  src: "./fonts/Kurdis-ExtraWideBlack.ttf",
  variable: "--font-kurdis",
  weight: "900",
});

export const metadata: Metadata = {
  title: "Me la juego por la vida",
  description: "Sube tu foto y únete a la campaña",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${barlowCondensed.variable} ${nunito.variable} ${kurdis.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: "#2D2EE0",
          fontFamily: "var(--font-body), Nunito, sans-serif",
          color: "#ffffff",
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
