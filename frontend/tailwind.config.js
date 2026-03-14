/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        }
      }
    },
  },
  plugins: [],
  // Optimize for production
  safelist: [
    'animate-fade-in',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'grid-cols-2',
    'hidden',
    'md:flex',
    'md:hidden',
    'hover:scale-105',
    'hover:-translate-y-1',
    'transition-all',
    'duration-300',
    'scale-105',
  ],
}
