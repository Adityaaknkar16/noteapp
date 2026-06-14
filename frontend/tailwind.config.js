export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--accent-rust)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        border: "var(--border)",
        accent: {
          rust: "var(--accent-rust)",
          sage: "var(--accent-sage)",
          ochre: "var(--accent-ochre)",
          blue: "var(--accent-blue)",
          red: "var(--accent-red)",
        }
      }
    }
  },
  plugins: [],
}