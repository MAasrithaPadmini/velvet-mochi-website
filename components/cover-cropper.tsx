"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

// Every cover on the site is shown at this shape (see BookCover), so what the
// author frames here is exactly what readers see.
export const COVER_ASPECT = 4 / 3;
const OUTPUT_WIDTH = 1600; // px; plenty for retina cards, keeps files small

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // needed to re-crop covers already in Supabase Storage
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that image."));
    img.src = src;
  });
}

async function cropToFile(src: string, area: Area): Promise<File> {
  // Bypass any cached non-CORS copy of a remote cover so the canvas isn't blocked.
  const img = await loadImage(src.startsWith("blob:") ? src : `${src}${src.includes("?") ? "&" : "?"}crop=1`);
  const width = Math.min(OUTPUT_WIDTH, Math.round(area.width));
  const height = Math.round(width / COVER_ASPECT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't crop the image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Your browser couldn't crop the image.");
  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}

export function CoverCropper({
  src,
  onCancel,
  onDone,
}: {
  src: string;
  onCancel: () => void;
  onDone: (file: File, previewUrl: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function apply() {
    if (!area) return;
    setBusy(true);
    setError("");
    try {
      const file = await cropToFile(src, area);
      onDone(file, URL.createObjectURL(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cropping failed.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
      <div className="glass w-full max-w-2xl rounded-[1.75rem] p-5">
        <h3 className="font-display text-2xl text-cream">Crop cover</h3>
        <p className="mt-1 text-sm text-cream/60">Drag to move, use the slider or pinch to zoom. This is exactly how readers will see it.</p>

        <div className="relative mt-4 h-[55vh] max-h-[420px] w-full overflow-hidden rounded-2xl bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={4}
            aspect={COVER_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-cream/70">
          Zoom
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#c9a876]"
          />
        </label>

        {error && <p className="mt-3 text-sm text-rose">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-cream/15 px-5 py-2.5 text-cream/80">
            Cancel
          </button>
          <button
            onClick={apply}
            disabled={busy || !area}
            className="rounded-full bg-champagne px-5 py-2.5 font-semibold text-velvet disabled:opacity-60"
          >
            {busy ? "Cropping…" : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
