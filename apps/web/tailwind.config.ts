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
      transitionDuration: {
        200: '200ms',
        250: '250ms'
      }
    }
  },
  plugins: []
}
export default config
