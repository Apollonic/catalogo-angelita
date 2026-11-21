/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5f2',
          100: '#f5ede8',
          200: '#eae4de',
          500: '#a66e58',
          600: '#8f5c48',
          700: '#764937',
        },
        surface: {
          light: '#faf8f6',
          muted: '#f2ece6',
        },
        font: {
          primary: '#222222',
          secondary: '#666666',
        },
        whatsapp: {
          DEFAULT: '#25d366',
          hover: '#1ebe5d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
