import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import "./globals.css";

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
  title: "Velvet Mochi | Moonlit Serialized Romance Library",
  description: "A serialized dark romance fiction platform by Padroha. Chubby cherubic heroines, possessive heroes, and stories that return every night with the moon.",
  keywords: [
    "serialized fiction",
    "dark romance",
    "Velvet Mochi",
    "Padroha",
    "romance novels",
    "chubby heroine romance",
    "Indian dark romance",
    "free romance reading",
  ],
  openGraph: {
    title: "Velvet Mochi",
    description: "Enter a moonlit library of serialized dark romance. New chapters daily.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
