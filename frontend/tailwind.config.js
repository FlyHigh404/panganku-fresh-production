/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app//*.{js,ts,jsx,tsx}",
    "./pages//*.{js,ts,jsx,tsx}",
    "./components//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      'custom-gray': '#8F8F8F'
    },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}