import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velvet Mochi | Free Serialized Dark Romance Stories by Padmini",
  description:
    "Velvet Mochi is a free online library of original serialized dark romance by Indian author Padmini: curvy heroines, possessive heroes, new chapters regularly.",
  applicationName: "Velvet Mochi",
  authors: [{ name: "Padmini", url: `${SITE_URL}/about` }],
  creator: "Padmini",
  publisher: "Velvet Mochi",
  keywords: [
    "serialized fiction",
    "dark romance",
    "Velvet Mochi",
    "Padmini",
    "romance novels",
    "chubby heroine romance",
    "Indian dark romance",
    "free romance reading",
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "Velvet Mochi",
    locale: "en_IN",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Velvet Mochi" }],
    title: "Velvet Mochi",
    description: "Enter a moonlit library of serialized dark romance. New chapters released regularly.",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <Footer />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
