/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00bcd4',
        secondary: '#4a5568',
        success: '#48bb78',
        warning: '#f6ad55',
        danger: '#fc8181',
        dark: '#2d3748',
        darker: '#1a202c',
      },
    },
  },
  plugins: [],
}