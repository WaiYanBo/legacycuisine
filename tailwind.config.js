/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vividRed: '#c81e1e',
        greyYellow: '#c5a059',
        brand: {
          white: '#ffffff',
          black: '#0f172a',
          red: '#c81e1e',
          redDark: '#9b1c1c',
          redLight: '#fef2f2',
          gold: '#c5a059',
        }
      },
    },
  },
  plugins: [],
}
