/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          'dark-blue': '#1B3C53', // Very dark, deep blue
          'medium-blue': '#456882', // Muted, medium-dark blue
          'light-beige': '#D2C1B6', // Light, warm beige
          'off-white': '#F9F3EF', // Very light, creamy off-white
        },
      },
    },
  },
  plugins: [],
}
