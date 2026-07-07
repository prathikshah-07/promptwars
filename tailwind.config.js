/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B21A8',
        accent: '#A78BFA',
        bgsoft: '#F5F3FF',
      },
    },
  },
  plugins: [],
};
