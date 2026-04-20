/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode (black + green)
        'dark-bg': '#0a0a0a',
        'dark-card': '#111111',
        'dark-border': '#222222',
        'dark-text': '#e0e0e0',
        'dark-text-secondary': '#a0a0a0',
        'accent-green': '#00ff9d',
        'accent-green-hover': '#00cc7a',

        // Light mode (white + blue)
        'light-bg': '#f8f9fa',
        'light-card': '#ffffff',
        'light-border': '#dee2e6',
        'light-text': '#212529',
        'light-text-secondary': '#6c757d',
        'accent-blue': '#0061d5',
        'accent-blue-hover': '#0050b0',
      },
    },
  },
  plugins: [],
}