"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "velvet-mochi-age-confirmed";

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // localStorage may be disabled (private mode); show the gate anyway
      setShow(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setShow(false);
  }

  function decline() {
    window.location.href = "https://www.google.com";
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-velvet/95 p-4 backdrop-blur-md animate-fade-in">
      <div className="glass max-w-md rounded-[1.75rem] p-6 sm:p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose/15 text-rose">
          <ShieldAlert size={26} />
        </div>
        <h2 className="mt-5 font-display text-3xl text-cream">A mature library</h2>
        <p className="mt-3 text-sm leading-6 text-cream/70">
          Velvet Mochi contains dark romance themes intended for adult readers. Some stories include possessive
          romance, power dynamics, violence, and other mature content. Please confirm you are 18 or older to enter.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={accept}
            className="rounded-full bg-champagne px-5 py-3 font-semibold text-velvet"
          >
            I&apos;m 18 or older — enter
          </button>
          <button
            onClick={decline}
            className="rounded-full border border-cream/12 px-5 py-3 text-sm text-cream/75"
          >
            I&apos;m under 18
          </button>
        </div>
        <p className="mt-4 text-xs text-cream/45">
          Each story also carries individual content warnings on its page.
        </p>
      </div>
    </div>
  );
}
