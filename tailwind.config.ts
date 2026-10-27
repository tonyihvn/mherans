

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './AppNew.tsx',
    './AppRedesigned.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'nherams-green': '#057A55',
        'nherams-dark-green': '#034F41',
      }
    }
  },
  plugins: []
}

export default config
