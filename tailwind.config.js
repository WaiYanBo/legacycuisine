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
        vividRed: '#aa0505',
        greyYellow: '#b0712d',
        brand: {
          white: '#ffffff',
          black: '#000000',
          red: '#aa0505',
          gold: '#b0712d',
        }
      },
    },
  },
  plugins: [],
}
