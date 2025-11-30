/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E5BFF',
          muted: '#E6ECFF',
        },
        accent: {
          DEFAULT: '#FF7139',
          muted: '#FFE8DE',
        },
        surface: {
          DEFAULT: '#0F172A',
          muted: '#162036',
        },
      },
      boxShadow: {
        card: '0 15px 40px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}
