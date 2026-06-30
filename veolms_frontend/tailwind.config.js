/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0E14",
          900: "#0F141C",
          800: "#161D29",
          700: "#212B3A",
          600: "#374255",
          500: "#5B6B85",
        },
        paper: {
          50: "#F7F5F0",
          100: "#EDEAE2",
          200: "#D8D3C6",
        },
        signal: {
          400: "#FFB454",
          500: "#FF9D2E",
          600: "#E8821A",
        },
        teal: {
          400: "#5CC8B8",
          500: "#3CA897",
        },
        danger: {
          400: "#FF6B6B",
          500: "#E8504F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,14,20,0.4), 0 8px 24px -8px rgba(10,14,20,0.5)",
        glow: "0 0 0 1px rgba(255,180,84,0.4), 0 0 24px rgba(255,157,46,0.25)",
      },
    },
  },
  plugins: [],
};
