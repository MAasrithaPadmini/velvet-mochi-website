"use client";

import { useEffect, useState } from "react";
import { Type, AlignJustify } from "lucide-react";

const FONT_SIZES = [
  { key: "sm", label: "S", rem: "1.05rem" },
  { key: "md", label: "M", rem: "1.2rem" },
  { key: "lg", label: "L", rem: "1.35rem" },
  { key: "xl", label: "XL", rem: "1.55rem" },
] as const;

const WIDTHS = [
  { key: "narrow", label: "Narrow", max: "42rem" },
  { key: "normal", label: "Normal", max: "56rem" },
  { key: "wide", label: "Wide", max: "72rem" },
] as const;

const FONT_KEY = "velvet-mochi-reader-font-size";
const WIDTH_KEY = "velvet-mochi-reader-width";

export function ReaderControls() {
  const [fontIdx, setFontIdx] = useState(1);
  const [widthIdx, setWidthIdx] = useState(1);

  useEffect(() => {
    try {
      const savedFont = localStorage.getItem(FONT_KEY);
      const savedWidth = localStorage.getItem(WIDTH_KEY);
      const fIdx = FONT_SIZES.findIndex((f) => f.key === savedFont);
      const wIdx = WIDTHS.findIndex((w) => w.key === savedWidth);
      if (fIdx >= 0) setFontIdx(fIdx);
      if (wIdx >= 0) setWidthIdx(wIdx);
      applyStyles(fIdx >= 0 ? fIdx : 1, wIdx >= 0 ? wIdx : 1);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyStyles(fIdx: number, wIdx: number) {
    const article = document.querySelector<HTMLElement>(".reader-prose");
    if (!article) return;
    article.style.fontSize = FONT_SIZES[fIdx].rem;
    article.style.maxWidth = WIDTHS[wIdx].max;
    article.style.marginLeft = "auto";
    article.style.marginRight = "auto";
  }

  function setFont(idx: number) {
    setFontIdx(idx);
    applyStyles(idx, widthIdx);
    try {
      localStorage.setItem(FONT_KEY, FONT_SIZES[idx].key);
    } catch {
      // ignore
    }
  }

  function setWidth(idx: number) {
    setWidthIdx(idx);
    applyStyles(fontIdx, idx);
    try {
      localStorage.setItem(WIDTH_KEY, WIDTHS[idx].key);
    } catch {
      // ignore
    }
  }

  return (
    <div className="glass mb-4 flex flex-wrap items-center gap-4 rounded-2xl p-3 text-sm">
      <div className="flex items-center gap-2">
        <Type size={15} className="text-cream/50" />
        <div className="flex gap-1">
          {FONT_SIZES.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setFont(i)}
              className={`size-8 rounded-full text-xs font-semibold transition ${
                i === fontIdx ? "bg-champagne text-velvet" : "bg-cream/8 text-cream/70 hover:bg-cream/14"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-5 w-px bg-cream/12" />

      <div className="flex items-center gap-2">
        <AlignJustify size={15} className="text-cream/50" />
        <div className="flex gap-1">
          {WIDTHS.map((w, i) => (
            <button
              key={w.key}
              onClick={() => setWidth(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                i === widthIdx ? "bg-champagne text-velvet" : "bg-cream/8 text-cream/70 hover:bg-cream/14"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
