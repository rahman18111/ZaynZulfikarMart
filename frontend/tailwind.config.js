/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        gold: {
          50: '#fdfbf2',
          100: '#fbf5dc',
          200: '#f6e7b3',
          300: '#f0d481',
          400: '#e7bd4f',
          500: '#d4af37', // Brand Signature Gold
          600: '#b89228',
          700: '#936f21',
          800: '#775820',
          900: '#63481e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 2px 8px -1px rgba(212, 175, 55, 0.2)',
        'gold-md': '0 4px 16px -2px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 24px -4px rgba(212, 175, 55, 0.35)',
      }
    },
  },
  plugins: [],
}
