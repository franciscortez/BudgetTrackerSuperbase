/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
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
        'dark-bg': '#0f0a15',
        'dark-card': '#1a1520',
        'dark-border': '#2d2433',
        'dark-text': '#e5e7eb',
        'dark-muted': '#9ca3af',
      },
    },
  },
  plugins: [],
}

