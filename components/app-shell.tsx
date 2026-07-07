import Link from "next/link";
import { LayoutDashboard, Moon, UserRound } from "lucide-react";
import { AmbientWorld } from "@/components/ambient-world";
import { MobileMenu } from "@/components/mobile-menu";
import { AgeGate } from "@/components/age-gate";
import { getCurrentProfile } from "@/lib/auth";

const links = [
  { href: "/library", label: "Library" },
  { href: "/bookshelf", label: "Bookshelf" },
  { href: "/about", label: "Author" },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile && (profile.role === "admin" || profile.role === "author");

  const navLinks = [...links];
  if (isAdmin) navLinks.push({ href: "/dashboard", label: "Dashboard" });

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <AmbientWorld />
      <AgeGate />

      <nav className="fixed left-1/2 top-3 z-50 w-[min(1120px,calc(100%-16px))] -translate-x-1/2 rounded-full border border-cream/10 bg-velvet/82 px-3 py-2 shadow-velvet backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 rounded-full px-2 text-cream">
            <span className="grid size-9 place-items-center rounded-full bg-champagne/16 text-champagne shadow-glow">
              <Moon size={18} />
            </span>
            <span className="font-display text-xl tracking-wide">Velvet Mochi</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-cream/72 transition hover:bg-cream/8 hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {profile ? (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 rounded-full border border-cream/12 bg-cream/6 px-3 py-1.5 text-sm text-cream/85"
              >
                <span className="grid size-6 place-items-center rounded-full bg-champagne/16 text-champagne">
                  <UserRound size={13} />
                </span>
                {profile.display_name}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-cream/12 bg-cream/6 px-3 py-1.5 text-sm text-cream/85"
              >
                Login
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/dashboard"
                className="hidden sm:grid size-9 place-items-center rounded-full bg-cream text-velvet shadow-glow"
                aria-label="Dashboard"
              >
                <LayoutDashboard size={16} />
              </Link>
            )}

            <MobileMenu links={navLinks} loggedIn={Boolean(profile)} />
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-24 sm:pt-28">{children}</div>
    </main>
  );
}

export function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <header className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[.28em] text-champagne/70">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-cream sm:text-6xl lg:text-7xl">{title}</h1>
      {copy && <p className="mt-5 max-w-3xl text-base sm:text-lg leading-7 sm:leading-8 text-cream/68">{copy}</p>}
    </header>
  );
}

export function AdminNav() {
  const items = [
    ["/dashboard", "Overview"],
    ["/dashboard/studio", "✍️ Studio"],
    ["/dashboard/stories", "Stories"],
    ["/dashboard/chapters", "Chapters"],
    ["/dashboard/author", "Author Page"],
    ["/dashboard/notifications", "Notifications"],
    ["/dashboard/moderation", "Moderation"],
    ["/dashboard/newsletter", "Newsletter"],
    ["/dashboard/analytics", "Analytics"],
    ["/dashboard/settings", "Settings"],
  ];
  return (
    <div className="mx-auto mb-6 flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-soft">
      {items.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="shrink-0 rounded-full border border-cream/10 bg-cream/6 px-4 py-2 text-sm text-cream/72 hover:bg-cream/12"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
