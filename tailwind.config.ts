import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        surface: 'rgba(255, 255, 255, 0.05)',
        'surface-hover': 'rgba(255, 255, 255, 0.1)',
        primary: '#38bdf8',
        'primary-hover': '#0ea5e9',
        accent: '#818cf8',
        glass: 'rgba(15, 23, 42, 0.65)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '32px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
