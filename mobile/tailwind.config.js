/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B0000",
        accent: "#8B0000",
        background: "#F4F6F8",
        surface: "#FFFFFF",
        "input-bg": "#F0F2F5",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        success: "#10B981",
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

