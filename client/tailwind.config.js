/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F5FA',
          100: '#E1ECF5',
          200: '#C3D8EA',
          300: '#9BBFDC',
          400: '#548DBE',
          500: '#235D92',
          600: '#16426D',
          700: '#0F3357',
          800: '#0B2545',
          900: '#061629',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        'text-primary': '#0F172A',
        'text-secondary': '#334155',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        'sm': ['0.9375rem', { lineHeight: '1.4rem' }],    // 15px
        'base': ['1.0625rem', { lineHeight: '1.65rem' }], // 17px
        'lg': ['1.1875rem', { lineHeight: '1.75rem' }],   // 19px
        'xl': ['1.375rem', { lineHeight: '1.875rem' }],   // 22px
        '2xl': ['1.625rem', { lineHeight: '2.125rem' }],  // 26px
        '3xl': ['2rem', { lineHeight: '2.375rem' }],      // 32px
        '4xl': ['2.5rem', { lineHeight: '2.875rem' }],    // 40px
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        dropdown: '0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        modal: '0 16px 40px -8px rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
}
