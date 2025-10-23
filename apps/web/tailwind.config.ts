import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'var(--paper)',
          2: 'var(--paper-2)'
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)'
        },
        border: 'var(--border)'
      },
      borderRadius: {
        '2xl': '1rem'
      },
      spacing: {
        // layout spacing tokens
        pagey: '48px',
        section: '32px',
        element: '16px',
        element2: '12px'
      },
      fontSize: {
        // typography tokens (monochrome, high readability)
        title: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' }], // 20px
        body: ['0.9375rem', { lineHeight: '1.5rem' }], // 15px
        caption: ['0.75rem', { lineHeight: '1rem' }] // 12px
      },
      transitionDuration: {
        200: '200ms',
        250: '250ms'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(17 17 17 / 0.05)'
      }
    }
  },
  plugins: []
}
export default config
