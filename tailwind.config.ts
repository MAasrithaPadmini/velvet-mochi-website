import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        velvet: "#07030a",
        plum: "#221128",
        burgundy: "#5c1730",
        rose: "#c991a4",
        champagne: "#e6c982",
        cream: "#fff4dc",
        moon: "#cfd7e7",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
      boxShadow: {
        velvet: "0 24px 90px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)",
        glow: "0 0 38px rgba(230,201,130,.22)",
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        drift: "drift 18s linear infinite",
        rain: "rain 1.4s linear infinite",
        floaty: "floaty 7s ease-in-out infinite",
        "fade-in": "fadeIn .5s ease-out",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: ".75", transform: "scale(1)" },
          "45%": { opacity: "1", transform: "scale(1.08)" },
          "70%": { opacity: ".58", transform: "scale(.98)" },
        },
        drift: {
          "0%": { transform: "translate3d(-8vw, 0, 0) rotate(0deg)" },
          "100%": { transform: "translate3d(108vw, 18vh, 0) rotate(360deg)" },
        },
        rain: {
          "0%": { transform: "translateY(-110%)", opacity: "0" },
          "12%": { opacity: ".35" },
          "100%": { transform: "translateY(110vh)", opacity: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-16px) rotate(1deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
