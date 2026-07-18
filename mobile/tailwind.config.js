/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#C89338",
        accent: "#C89338",
        background: "#F4F6F8",
        surface: "#FFFFFF",
        "input-bg": "#F2F4F7",
        "text-primary": "#182F4B",
        "text-secondary": "#8A8A8E",
        success: "#28A745",
      },
      fontFamily: {
        baloobhai2: ["BalooBhai2", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  presets: [require("nativewind/preset")],
  plugins: [],
}
