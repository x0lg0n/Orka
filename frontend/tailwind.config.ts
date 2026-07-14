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
        // ── Semantic aliases (design system) ──
        shell: "#030914",
        sidebar: "#06101f",
        panel: "#0a1c2e",
        primary: "#9474ff",
        success: "#22bd93",
        warning: "#ff8a22",
        danger: "#ff4f42",
        info: "#3b82f6",
        border: "rgba(255,255,255,0.08)",
        muted: "rgba(255,255,255,0.55)",
        disabled: "rgba(255,255,255,0.30)",
        focus: "rgba(148,116,255,0.55)",
        hover: "rgba(255,255,255,0.06)",
      },
      borderRadius: {
        control: "8px",
        card: "12px",
        panel: "16px",
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
