/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#E8F0E6',
          100: '#D1E1CD',
          200: '#A3C39B',
          300: '#75A569',
          400: '#479337',
          500: '#6B8A62',
          600: '#5A7352',
          700: '#495C43',
          800: '#384534',
          900: '#272E25'
        }
      }
    }
  },
  plugins: []
}