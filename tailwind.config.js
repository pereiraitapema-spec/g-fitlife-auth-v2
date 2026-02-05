import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '50px': '50px',
        '60px': '60px',
      },
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindAnimate,
    function({ addComponents, addUtilities, addBase }) {
      addBase({
        'body': {
          '@apply bg-slate-50 text-slate-900 overflow-x-hidden': {},
          '-webkit-tap-highlight-color': 'transparent',
        },
      });
      addComponents({
        '.glass': {
          '@apply bg-white/80 backdrop-blur-xl border border-slate-200': {},
        },
      });
      addUtilities({
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            '@apply bg-slate-200 rounded-full': {},
            '&:hover': {
              '@apply bg-slate-300': {},
            },
          },
        },
      });
    },
  ],
}