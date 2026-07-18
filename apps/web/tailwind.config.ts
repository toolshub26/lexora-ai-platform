import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f8fafc",

        primary: "#2563eb",
        secondary: "#7c3aed",

        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,.25)",
      },
    },
  },

  plugins: [],
};

export default config;
