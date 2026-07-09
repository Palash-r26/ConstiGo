/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#9C101A",
        accent: "#FF4B3A",
        background: "#F4F6F8",
        surface: "#FFFFFF",
        "input-bg": "#F2F4F7",
        "text-primary": "#1C1C1C",
        "text-secondary": "#8A8A8E",
        success: "#28A745",
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
