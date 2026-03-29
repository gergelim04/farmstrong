import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          dark: '#0B2B1F',
        },
        accent: {
          DEFAULT: '#E76F51',
          light: '#F4845F',
          dark: '#C45A3C',
        },
        background: '#FAFAF5',
        field: '#F0EDE6',
      },
    },
  },
  plugins: [],
}

export default config
