import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        tech: ['"Space Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 40px -10px hsl(186 100% 50%)',
        'glow-magenta': '0 0 40px -10px hsl(320 100% 60%)',
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        tilt: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-90deg)" },
        },
        ripple: {
          from: { transform: "scale(1)", opacity: "0.7" },
          to: { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-5px)" },
          "75%": { transform: "translateY(-25px) translateX(5px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.05)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(20px, -20px) rotate(2deg)" },
          "50%": { transform: "translate(-10px, 10px) rotate(-1deg)" },
          "75%": { transform: "translate(15px, 5px) rotate(1deg)" },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "auth-flare": {
          "0%": { opacity: "0", transform: "translateX(-100%) skewX(-15deg)" },
          "20%": { opacity: "0.7" },
          "100%": { opacity: "0", transform: "translateX(200%) skewX(-15deg)" },
        },
        "auth-particle-float": {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)", opacity: "0.3" },
          "25%": { transform: "translateY(-30px) translateX(15px) scale(1.1)", opacity: "0.6" },
          "50%": { transform: "translateY(-50px) translateX(-10px) scale(0.9)", opacity: "0.4" },
          "75%": { transform: "translateY(-20px) translateX(20px) scale(1.05)", opacity: "0.5" },
        },
        "auth-border-glow": {
          "0%, 100%": {
            borderColor: "rgba(0, 180, 230, 0.15)",
            boxShadow: "0 0 40px -15px rgba(0, 180, 230, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
          },
          "50%": {
            borderColor: "rgba(0, 200, 255, 0.25)",
            boxShadow: "0 0 60px -15px rgba(0, 200, 255, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        glow: "glow 2s ease-in-out infinite",
        tilt: "tilt 5s ease-in-out infinite",
        ripple: "ripple 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        drift: "drift 20s ease-in-out infinite",
        gradient: "gradient 3s ease infinite",
        marquee: "marquee 20s linear infinite",
        "auth-flare": "auth-flare 6s ease-in-out infinite 1s",
        "auth-particle-float": "auth-particle-float 15s ease-in-out infinite",
        "auth-border-glow": "auth-border-glow 4s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "gradient-cyan": "linear-gradient(135deg, #00d4ff 0%, #00f5d4 100%)",
        "gradient-magic": "linear-gradient(135deg, #ff00ff 0%, #00d4ff 100%)",
        "grid-pattern": "linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
