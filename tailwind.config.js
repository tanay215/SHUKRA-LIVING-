/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2B1E16', // Dark Coffee / Deepest Brown
        secondary: '#8A8A8A', // Muted Gray
        accent: '#C9A45C', // Muted Gold
        cream: '#F7F4EF', // Warm Off-White
        surface: '#FFFFFF', // Pure white
        'olive-dark': '#403c17', // Keep for compatibility if needed, or remove if unused
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Main text
        heading: ['Montserrat', 'sans-serif'], // Headings
        serif: ['Playfair Display', 'serif'], // Elegant serif for titles
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/hero-bg.jpg')", // Placeholder
      }
    },
  },
  plugins: [],
}