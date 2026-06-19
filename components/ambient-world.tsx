export function AmbientWorld() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(207,215,231,.11),transparent_34rem)]" />

      {/* The moon — top right, glowing with texture */}
      <div className="absolute right-[8%] top-[6%] sm:right-[12%] sm:top-[8%]">
        <div className="relative animate-floaty">
          {/* Halo glow rings */}
          <div className="absolute inset-0 -m-12 rounded-full bg-champagne/8 blur-3xl" />
          <div className="absolute inset-0 -m-6 rounded-full bg-moon/15 blur-2xl" />

          {/* Moon body */}
          <div className="relative size-32 sm:size-40 lg:size-48 rounded-full bg-gradient-to-br from-cream via-moon to-cream/40 shadow-[0_0_60px_rgba(255,244,220,.35),inset_-12px_-8px_30px_rgba(34,17,40,.45)]">
            {/* Craters / texture */}
            <span className="absolute top-[22%] left-[28%] size-3 rounded-full bg-velvet/20 blur-[2px]" />
            <span className="absolute top-[58%] left-[18%] size-2 rounded-full bg-velvet/25 blur-[1px]" />
            <span className="absolute top-[35%] right-[22%] size-4 rounded-full bg-velvet/15 blur-[3px]" />
            <span className="absolute bottom-[26%] right-[34%] size-2.5 rounded-full bg-velvet/20 blur-[2px]" />
            <span className="absolute top-[68%] right-[18%] size-1.5 rounded-full bg-velvet/30 blur-[1px]" />
            <span className="absolute top-[15%] right-[40%] size-1 rounded-full bg-velvet/25" />
            <span className="absolute bottom-[18%] left-[42%] size-2 rounded-full bg-velvet/20 blur-[2px]" />

            {/* Crescent shadow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-l from-transparent via-velvet/10 to-velvet/45" />
          </div>

          {/* Star sparkles around moon */}
          <span className="absolute -left-12 top-4 size-1 animate-flicker rounded-full bg-champagne shadow-[0_0_8px_rgba(230,201,130,.9)]" />
          <span className="absolute -left-6 -top-8 size-0.5 animate-flicker rounded-full bg-cream shadow-[0_0_6px_rgba(255,244,220,.8)]" style={{ animationDelay: "-1.4s" }} />
          <span className="absolute -bottom-4 -right-10 size-1 animate-flicker rounded-full bg-champagne shadow-[0_0_8px_rgba(230,201,130,.9)]" style={{ animationDelay: "-0.7s" }} />
        </div>
      </div>

      {/* Drifting rose petals */}
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          key={`petal-${index}`}
          className="absolute h-3 w-5 animate-drift rounded-[999px_999px_999px_0] bg-rose/45 blur-[.2px]"
          style={{
            top: `${(index * 11) % 92}%`,
            left: `${-18 - (index % 5) * 9}%`,
            animationDelay: `${index * -1.15}s`,
            animationDuration: `${16 + (index % 6) * 3}s`,
          }}
        />
      ))}

      {/* Fireflies / stars */}
      {Array.from({ length: 50 }).map((_, index) => (
        <span
          key={`firefly-${index}`}
          className="absolute size-1 animate-flicker rounded-full bg-champagne shadow-[0_0_12px_rgba(230,201,130,.9)]"
          style={{
            top: `${(index * 17) % 96}%`,
            left: `${(index * 23) % 100}%`,
            animationDelay: `${index * -0.28}s`,
          }}
        />
      ))}

      {/* Light rain */}
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={`rain-${index}`}
          className="absolute top-0 h-24 w-px animate-rain bg-gradient-to-b from-transparent via-moon/30 to-transparent"
          style={{
            left: `${(index * 7) % 100}%`,
            animationDelay: `${index * -0.09}s`,
            animationDuration: `${1.1 + (index % 4) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}
