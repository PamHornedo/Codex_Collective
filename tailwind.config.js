/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E8B57',      // Teal branding
        accent: '#FF6B9D',       // Pink/coral interactive
        'bg-neutral': '#F5F5F5', // Neutral pastel background
      },
    },
  },
  plugins: [],
}