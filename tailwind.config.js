/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Reffie brand palette
        brand: {
          DEFAULT: '#10BD91', // --g  primary green
          dark: '#0C8E6D',    // --gd dark green
          mid: '#0EA57F',     // --gm mid green (hover)
          tint: '#E8F8F3',    // --gt green tint (bg accents)
        },
        page: '#FAF8F5',      // --bg  page background
        surface: '#FFFFFF',   // --surf card / panel surface
        ink: '#1A1A1A',       // --ink  near-black body text
        muted: '#6B6B6B',     // --muted secondary text
        hint: '#A0A0A0',      // --hint placeholder / tertiary text
        amber: '#E5A30E',     // warning amber
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        sm: '8px',      // --rsm  inputs, small elements
        md: '12px',     // --rmd  cards (spec requirement)
        lg: '16px',     // --rlg  table card
        pill: '100px',  // --rpill  buttons, badges, search
      },

      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['13px', { lineHeight: '1.6' }],
        base: ['14px', { lineHeight: '1.6' }],
        md: ['15px', { lineHeight: '1.6' }],
        lg: ['17px', { lineHeight: '1.4' }],
        xl: ['28px', { lineHeight: '1.15' }],
      },

      boxShadow: {
        // Spec: NO drop shadows on cards. Only focus rings.
        focus: '0 0 0 3px rgba(16,189,145,0.12)',
        'step-current': '0 0 0 4px rgba(16,189,145,0.18)',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
        'spring-soft': 'cubic-bezier(0.34,1.2,0.64,1)',
      },

      // Named border colors (use with border-[color] or border-DEFAULT etc.)
      borderColor: {
        DEFAULT: 'rgba(0,0,0,0.08)',   // --bord  default card/table border
        strong: 'rgba(0,0,0,0.14)',    // --bords  input border
      },
    },
  },
  plugins: [],
};

