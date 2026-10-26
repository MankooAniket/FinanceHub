/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',   

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
  ],
}
