/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        card: '#111111',
        border: '#1F1F1F',
        foreground: '#FAFAFA',
        'muted-foreground': '#6B7280',
        // Role-specific accent colors
        waiter: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.3)',
        },
        kitchen: {
          DEFAULT: '#F43F5E',
          glow: 'rgba(244, 63, 94, 0.3)',
        },
        cashier: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.3)',
        },
        customer: {
          DEFAULT: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.3)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
}