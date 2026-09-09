/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          border: '#E5E5EA',
          subtext: '#86868B',
          darkBg: '#000000',
          darkCard: '#1C1C1E',
          darkElevated: '#2C2C2E',
          darkBorder: '#38383A',
          blue: '#007AFF',
          red: '#FF2D55',
          orange: '#FF9500',
          green: '#34C759',
        },
      }
    },
  },
  plugins: [],
}
