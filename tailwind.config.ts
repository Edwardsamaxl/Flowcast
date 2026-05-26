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
        paper: {
          0: "#fffdf8",
          50: "#f8f3ea",
          100: "#efe7d9",
          200: "#ded2bf"
        },
        ink: {
          950: "#201b17",
          800: "#3f352d",
          600: "#75685a",
          400: "#a79a8a"
        },
        seal: {
          50: "#f8e8df",
          500: "#b4472f",
          600: "#963824"
        },
        sage: {
          500: "#6f7d59"
        },
        amber: {
          500: "#b9822e"
        },
        red: {
          500: "#a6382e"
        }
      },
      boxShadow: {
        hairline: "inset 0 0 0 1px #ded2bf",
        sheet: "0 1px 2px rgba(32, 27, 23, 0.04), inset 0 0 0 1px #e7dccd",
        float: "0 18px 44px rgba(32, 27, 23, 0.14), inset 0 0 0 1px rgba(32, 27, 23, 0.08)",
        action: "0 1px 2px rgba(32, 27, 23, 0.12), 0 10px 24px rgba(180, 71, 47, 0.18)"
      },
      borderRadius: {
        tag: "4px",
        button: "6px",
        card: "10px",
        drawer: "14px"
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
};

export default config;
