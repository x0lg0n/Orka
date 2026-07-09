import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#00081F",
        ink: "#061A2B",
        night: "#082033",
        paper: "#fffaf2",
        bone: "#f5efe4",
        orange: "#ff8a22",
        coral: "#ff4f42",
        violet: "#9474ff",
        lime: "#eaff35",
        teal: "#22bd93",
      },
      boxShadow: {
        hard: "8px 8px 0 #061a2b",
        glow: "0 24px 70px rgba(234, 255, 53, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
