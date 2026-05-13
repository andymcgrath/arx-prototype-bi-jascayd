import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Open Sans", "-apple-system", "Roboto", "Helvetica", "sans-serif"],
      },
      colors: {
        /* ─── AssistRx Brand Colors ─── */
        "arx-primary": "hsl(var(--arx-primary))",
        "arx-primary-dark": "hsl(var(--arx-primary-dark))",
        "arx-primary-80": "hsl(var(--arx-primary-80))",
        "arx-primary-30": "hsl(var(--arx-primary-30))",
        "arx-secondary": "hsl(var(--arx-secondary))",
        "arx-sky": "hsl(var(--arx-sky))",

        /* ─── Neutrals ─── */
        "arx-slate": "hsl(var(--arx-slate))",
        "arx-body-copy": "hsl(var(--arx-body-copy))",
        "arx-neutral-800": "hsl(var(--arx-neutral-800))",
        "arx-neutral-100": "hsl(var(--arx-neutral-100))",
        "arx-neutral-000": "hsl(var(--arx-neutral-000))",

        /* ─── Functional ─── */
        "arx-errors": "hsl(var(--arx-errors))",
        "arx-orange": "hsl(var(--arx-orange))",
        "arx-links": "hsl(var(--arx-links))",
        "arx-optional": "hsl(var(--arx-optional))",
        "arx-inactive": "hsl(var(--arx-inactive))",
        "arx-borders": "hsl(var(--arx-borders))",
        "arx-background": "hsl(var(--arx-background))",

        /* ─── Assistivan / legacy aliases → map to AssistRx tokens ─── */
        "teal": "#007178",
        "keppel": "#338D93",
        "slate": "#414042",
        "body-copy": "#6F7276",
        "app-bg": "#F8F8F8",
        "border-light": "#E0E0E0",
        "foundayo-teal": "#007178",
        "foundayo-teal-tint": "#ADE2E3",
        "assistivan-orange": "#EF8A13",

        /* ─── Shadcn/ui colors ─── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
