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
        surface: "#ffffff",
        surfaceMuted: "#f7f8fc",
        text: "#11182d",
        textMuted: "#5f6b86",
        textSubtle: "#8b95aa",
        line: "#e5e8f0",
      },
      fontFamily: {
        product: ["var(--font-dm-sans)", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        control: "8px",
        card: "12px",
        panel: "16px",
      },
      boxShadow: {
        hard: "8px 8px 0 #061a2b",
        glow: "0 24px 70px rgba(234, 255, 53, 0.18)",
        "product-card": "0 1px 2px rgba(16, 24, 40, 0.03), 0 8px 24px rgba(16, 24, 40, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
