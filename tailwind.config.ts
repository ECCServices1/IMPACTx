import type { Config } from "tailwindcss";

/**
 * IMPACTx runs one considered look: warm paper, ink, and card stock. There is no
 * dark mode on purpose. Deck colour arrives per card through a CSS variable, so
 * the palette here stays neutral and the cards carry the colour.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF9F6",
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#171310",
          soft: "#6B625B",
          faint: "#9C938B",
        },
        line: "#E9E3DA",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        "accent-wash": "var(--accent-wash)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Iowan Old Style", "Georgia", "serif"],
      },
      boxShadow: {
        // Two contact shadows and one ambient, which is what makes a rectangle
        // read as a piece of card sitting on a surface rather than a coloured div.
        card: "0 1px 1px rgba(23,19,16,0.05), 0 3px 6px -2px rgba(23,19,16,0.05), 0 10px 20px -8px rgba(23,19,16,0.10)",
        lift: "0 2px 4px rgba(23,19,16,0.06), 0 14px 28px -10px rgba(23,19,16,0.14), 0 36px 56px -24px rgba(23,19,16,0.20)",
        deck: "0 1px 2px rgba(23,19,16,0.06), 0 8px 20px -8px rgba(23,19,16,0.16)",
      },
      borderRadius: {
        card: "20px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "deal-in": {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.96) rotate(-1.5deg)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1) rotate(0deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "deal-in": "deal-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
