/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff0f5',
          100: '#ffe4e9',
          200: '#ffb6c1',
          300: '#ffc0cb',
          400: '#ff9ead',
          500: '#ff7a93',
          600: '#e85d7a',
          700: '#c94466',
          800: '#a32e50',
          900: '#7d1a3a',
        },
      },
    },
  },
  plugins: [],
}

