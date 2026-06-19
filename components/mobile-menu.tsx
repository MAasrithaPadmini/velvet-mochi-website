"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MobileMenu({ links, loggedIn }: { links: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-9 place-items-center rounded-full border border-cream/12 bg-cream/6 text-cream lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={17} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute inset-0 bg-velvet/80 backdrop-blur-md"
          />
          <div className="absolute right-3 top-3 w-[min(320px,calc(100%-24px))] rounded-[1.5rem] border border-cream/12 bg-velvet shadow-velvet animate-fade-in">
            <div className="flex items-center justify-between p-4">
              <span className="font-display text-2xl text-cream">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-cream/12 text-cream/80"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1 p-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base text-cream/85 hover:bg-cream/8"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-base text-cream/85 hover:bg-cream/8"
              >
                Profile
              </Link>
              {loggedIn ? (
                <button
                  onClick={signOut}
                  className="mt-2 block w-full rounded-2xl border border-rose/25 px-4 py-3 text-left text-base text-rose"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 block rounded-2xl bg-champagne px-4 py-3 text-center font-semibold text-velvet"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
