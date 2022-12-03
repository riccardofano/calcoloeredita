/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './templates/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      primary: colors.blue,
      black: '#000',
      gray: colors.gray,
      white: '#fff',
      transparent: 'transparent',
      danger: colors.red,
    },
    extend: {},
  },
  plugins: [],
}
