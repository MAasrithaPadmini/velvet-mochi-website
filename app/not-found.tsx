import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Moon } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <section className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div className="glass rounded-[2rem] p-8 sm:p-12 max-w-lg">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-champagne/15 text-champagne">
            <Moon size={36} />
          </div>
          <h1 className="mt-6 font-display text-5xl text-cream">404</h1>
          <h2 className="mt-3 font-display text-3xl text-cream">
            Lost in the moonlit library
          </h2>
          <p className="mt-4 text-cream/60 leading-7">
            The page you&apos;re looking for has wandered off into the dark. 
            Perhaps it was a chapter that hasn&apos;t been written yet, 
            or a story still dreaming itself into existence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-full bg-champagne px-5 py-3 font-semibold text-velvet shadow-glow"
            >
              Return home 🌙
            </Link>
            <Link
              href="/library"
              className="rounded-full border border-cream/12 px-5 py-3 text-cream/80"
            >
              Browse library
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
