import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          0: "oklch(99% 0.003 245)",
          50: "oklch(97% 0.004 245)",
          100: "oklch(94% 0.006 245)"
        },
        surface: {
          0: "oklch(100% 0.002 245)",
          50: "oklch(96% 0.005 245)",
          100: "oklch(91% 0.007 245)"
        },
        ink: {
          950: "oklch(18% 0.018 255)",
          800: "oklch(28% 0.016 255)",
          600: "oklch(45% 0.014 255)",
          400: "oklch(64% 0.012 255)"
        },
        line: {
          200: "oklch(88% 0.008 245)",
          300: "oklch(82% 0.010 245)"
        },
        calibrate: {
          50: "oklch(94% 0.025 250)",
          500: "oklch(55% 0.115 250)",
          600: "oklch(48% 0.105 250)"
        },
        amber: {
          500: "oklch(63% 0.115 75)"
        },
        green: {
          500: "oklch(58% 0.105 150)"
        },
        red: {
          500: "oklch(55% 0.125 28)"
        }
      },
      boxShadow: {
        ring: "inset 0 0 0 1px oklch(88% 0.008 245)",
        editor: "inset 0 0 0 1px oklch(86% 0.009 245), 0 1px 2px rgba(20,31,46,0.04)",
        action: "0 1px 2px rgba(20,31,46,0.10), 0 8px 24px rgba(38,91,168,0.14)",
        float: "0 18px 48px rgba(20,31,46,0.16), inset 0 0 0 1px rgba(20,31,46,0.08)"
      },
      borderRadius: {
        tag: "6px",
        button: "8px",
        card: "12px",
        drawer: "16px"
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
};

export default config;
