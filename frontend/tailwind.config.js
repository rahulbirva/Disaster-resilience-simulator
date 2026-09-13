/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          functional: '#10b981',
          stressed: '#f59e0b',
          failed: '#ef4444',
          cut_off: '#ef4444',
          delayed: '#f59e0b',
          reachable: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
