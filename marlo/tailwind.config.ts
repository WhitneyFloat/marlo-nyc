import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:           '#1A1917',
        'ink-soft':    '#2C2B28',
        cream:         '#F8F4EE',
        'warm-white':  '#FDFAF6',
        parchment:     '#EDE8E0',
        terracotta:    '#C4603A',
        'terra-light': '#E8896A',
        'terra-glow':  '#F2A882',
        sage:          '#6B9E70',
        'sage-light':  '#9DC4A0',
        'sage-pale':   '#D4EAD6',
        gold:          '#C9A44C',
        'gold-light':  '#E8C97A',
        'gold-pale':   '#FBF3DC',
        stone:         '#8C8478',
        'stone-light': '#B8B2AA',
        'stone-pale':  '#E4DED6',
      },
      fontFamily: {
        display: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
        body:    ['"Gill Sans"', '"Gill Sans MT"', 'Calibri', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
