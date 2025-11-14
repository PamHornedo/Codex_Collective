/** @type {import('tailwindcss').Config} */ export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        "bg-main": "var(--color-bg)",
        card: "var(--color-card)",
      },
    },
  },
  plugins: [],
};
