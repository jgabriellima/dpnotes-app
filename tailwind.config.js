/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Pastel Coral Palette (Light Mode - Primary)
        'primary-darker': '#ff6b52',  // Coral escuro (alto contraste)
        'primary-dark': '#ff8674',    // Coral médio escuro
        primary: '#ffccc3',           // Coral pastel (main accent)
        'primary-light': '#ffd9d2',   // Coral pastel médio
        'primary-lighter': '#ffe6e1', // Coral pastel claro
        'primary-lightest': '#fff2f0', // Coral pastel mais claro (background)
        
        // Text Colors
        'text-primary': '#2D313E',    // Texto principal (cinza escuro)
        'text-secondary': '#6C6F7D',  // Texto secundário (cinza médio)
        
        // Functional Colors
        badge: '#ffe6e1',             // Badge background
        highlight: '#fff9d9',         // Text highlight
        destructive: '#FF5C5C',       // Destructive actions
        'destructive-light': '#FFE5E5', // Destructive background
        
        // Dark Mode (for future implementation)
        dark: {
          background: '#1A202C',
          surface: '#2D3748',
          primary: '#4A5568',
          accent: '#ffccc3',
          'text-primary': '#F7FAFC',
          'text-secondary': '#E2E8F0',
          border: '#4A5568',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '25.2px', letterSpacing: '-0.015em' }],
        '2xl': ['24px', { lineHeight: '31.2px', letterSpacing: '-0.4px' }],
        '3xl': ['32px', { lineHeight: '38.4px', letterSpacing: '-0.6px' }],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
};

