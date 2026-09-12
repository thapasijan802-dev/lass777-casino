import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#080a10',
        card: '#0f141f',
        'card-hover': '#182030',
        casino: {
          gold: '#f59e0b',
          'gold-light': '#fcd34d',
          'gold-dark': '#b45309',
          neon: '#00f2fe',
          cyan: '#06b6d4',
          magenta: '#ec4899',
          purple: '#8b5cf6',
          dark: '#07090e',
          surface: '#121722',
          border: 'rgba(245, 158, 11, 0.2)',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
        'gold-text': 'linear-gradient(180deg, #fffbeb 0%, #fcd34d 40%, #f59e0b 80%, #b45309 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
        'purple-glow': 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)',
        'gold-glow': 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2), transparent 70%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'gold-glow-lg': '0 0 40px 0px rgba(245, 158, 11, 0.6)',
        'neon-glow': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 4s ease-in-out infinite',
        'shimmer-slide': 'shimmer 2.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
