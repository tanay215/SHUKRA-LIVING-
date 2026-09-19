/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C1810', // Deep Chocolate Brown
        secondary: '#DBC1AC', // Soft Beige/Nude
        accent: '#C5A059', // Gold
        olive: '#4A5D23', // Deep Olive/Forest Green
        cream: '#F5F5F0', // Off-White/Cream/Beige background
        surface: '#FFFFFF', // Pure white for cards/surfaces
        muted: '#8D8D8D', // Muted text
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Main text
        heading: ['Montserrat', 'sans-serif'], // Headings
      },
      backgroundImage: {
        'hero-pattern': "url('/assets/hero-bg.jpg')", // Placeholder
      }
    },
  },
  plugins: [],
}