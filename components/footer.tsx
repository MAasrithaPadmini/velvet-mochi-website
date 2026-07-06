import Link from "next/link";
import { Moon } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-cream/8 bg-velvet/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-cream/60">
            <Moon size={16} className="text-champagne" />
            <span className="font-display text-lg text-cream">Velvet Mochi</span>
            <span className="text-cream/40">by Padroha</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-cream/45">
            <Link href="/terms" className="hover:text-champagne transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-champagne transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-champagne transition-colors">
              About the Author
            </Link>
            <Link href="/library" className="hover:text-champagne transition-colors">
              Library
            </Link>
            <Link href="/schedule" className="hover:text-champagne transition-colors">
              Release Schedule
            </Link>
            <Link href="/content-guide" className="hover:text-champagne transition-colors">
              Content Guide
            </Link>
            <Link href="/faq" className="hover:text-champagne transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-champagne transition-colors">
              Contact & Support
            </Link>
          </div>

          <p className="text-xs text-cream/35">
            © {new Date().getFullYear()} Padroha. All rights reserved.
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-cream/25">
          All stories are works of fiction. Content intended for readers 18+. 🌙
        </div>
      </div>
    </footer>
  );
}
