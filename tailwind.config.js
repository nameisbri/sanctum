/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctum: {
          950: '#0a0a0b',
          900: '#111114',
          850: '#18181c',
          800: '#1f1f24',
          700: '#2a2a30',
          600: '#3a3a42',
          500: '#52525e',
          400: '#7a7a88',
          300: '#a1a1ad',
          200: '#d4d4dc',
          100: '#ededf0',
          50: '#fafafe',
        },
        blood: {
          900: '#3b0a0a',
          800: '#5c1010',
          700: '#7f1d1d',
          600: '#991b1b',
          500: '#b91c1c',
          400: '#dc2626',
          300: '#ef4444',
        },
        metal: {
          gold: '#c9a84c',
          silver: '#94a3b8',
          bronze: '#a67c52',
          steel: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        gothic: ['UnifrakturMaguntia', 'cursive'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up-sheet': 'slideUpSheet 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUpSheet: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
