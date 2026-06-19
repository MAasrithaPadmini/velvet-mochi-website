import Link from "next/link";
import Image from "next/image";
import { AppShell, PageHeader } from "@/components/app-shell";
import { createServiceClient } from "@/lib/supabase/service";
import { Instagram, Twitter, Globe, Mail, BookOpen } from "lucide-react";

export const revalidate = 30;

type AuthorProfile = {
  name: string;
  tagline: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  goodreads: string | null;
  website: string | null;
  email: string | null;
  fun_facts: string[];
};

async function getAuthorProfile(): Promise<AuthorProfile | null> {
  const svc = createServiceClient();
  if (!svc) return null;
  const { data } = await svc.from("author_profile").select("*").eq("id", 1).maybeSingle();
  return data as AuthorProfile | null;
}

async function getPublishedStoriesCount(): Promise<number> {
  const svc = createServiceClient();
  if (!svc) return 0;
  const { count } = await svc
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}

export default async function AboutPage() {
  const profile = await getAuthorProfile();
  const storiesCount = await getPublishedStoriesCount();

  const name = profile?.name ?? "Velvet Mochi";
  const tagline = profile?.tagline ?? "Author of moonlit dark romance";
  const bio = profile?.bio ?? "";
  const funFacts = profile?.fun_facts ?? [];

  return (
    <AppShell>
      <PageHeader eyebrow="About the author" title={name} copy={tagline} />

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="glass overflow-hidden rounded-[2rem]">
          {profile?.cover_url && (
            <div className="relative h-44 sm:h-56 w-full overflow-hidden">
              <Image src={profile.cover_url} alt="Cover" fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-velvet via-velvet/40 to-transparent" />
            </div>
          )}

          <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-end sm:gap-7 sm:p-8 -mt-12 sm:-mt-16 relative">
            <div className="relative size-28 sm:size-36 shrink-0 overflow-hidden rounded-full border-4 border-velvet bg-gradient-to-br from-burgundy via-plum to-velvet shadow-velvet">
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={name} fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-5xl text-champagne">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-3xl sm:text-4xl text-cream">{name}</h2>
              <p className="mt-1 text-sm text-champagne/85">{tagline}</p>
              <p className="mt-2 text-xs text-cream/55">
                {storiesCount} {storiesCount === 1 ? "story" : "stories"} published
              </p>
            </div>
          </div>

          {bio && (
            <div className="border-t border-cream/8 px-6 py-6 sm:px-8 sm:py-8">
              <p className="whitespace-pre-wrap font-serif text-lg leading-8 text-cream/85">{bio}</p>
            </div>
          )}

          {funFacts.length > 0 && (
            <div className="border-t border-cream/8 px-6 py-6 sm:px-8 sm:py-8">
              <h3 className="font-display text-2xl text-cream">Things to know about me</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {funFacts.map((fact, i) => (
                  <li key={i} className="rounded-2xl border border-cream/10 bg-cream/5 px-4 py-3 text-sm text-cream/75">
                    <span className="text-champagne">✦</span> {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-cream/8 px-6 py-6 sm:px-8 sm:py-8">
            <h3 className="font-display text-2xl text-cream">Find me</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.instagram && (
                <SocialLink href={profile.instagram} icon={<Instagram size={15} />} label="Instagram" />
              )}
              {profile?.twitter && (
                <SocialLink href={profile.twitter} icon={<Twitter size={15} />} label="Twitter / X" />
              )}
              {profile?.tiktok && (
                <SocialLink href={profile.tiktok} icon={<span className="text-base">🎵</span>} label="TikTok" />
              )}
              {profile?.goodreads && (
                <SocialLink href={profile.goodreads} icon={<BookOpen size={15} />} label="Goodreads" />
              )}
              {profile?.website && (
                <SocialLink href={profile.website} icon={<Globe size={15} />} label="Website" />
              )}
              {profile?.email && (
                <SocialLink href={`mailto:${profile.email}`} icon={<Mail size={15} />} label="Email" />
              )}
              {!profile?.instagram &&
                !profile?.twitter &&
                !profile?.tiktok &&
                !profile?.goodreads &&
                !profile?.website &&
                !profile?.email && (
                  <p className="text-sm text-cream/55">No social links yet. The author will add them soon.</p>
                )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 rounded-full bg-champagne px-5 py-3 font-semibold text-velvet shadow-glow"
          >
            Browse my library →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/6 px-4 py-2 text-sm text-cream/85 hover:bg-cream/10"
    >
      {icon} {label}
    </a>
  );
}
