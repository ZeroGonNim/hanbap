export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f5f0e1",
        secondary: "#d4a373",
        accent: "#bc6c25",
        brand: "#283618",
        boneWhite: "#fefae0",
      },
      fontFamily: {
        serif: ["'Noto Serif KR'", "serif"],
        sans: ["Pretendard", "sans-serif"],
        gowun: ["'Gowun Batang'", "serif"],
        brush: ["'Nanum Brush Script'", "cursive"],
      },
    },
  },
  plugins: [],
}
