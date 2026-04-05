/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hb-cream': '#FBF9F4',      // Primary Background
        'hb-beige': '#F5EDE3',      // Secondary Background
        'hb-brown': '#3B2517',      // Main Text
        'hb-red': '#A03A30',        // Accent Red (Heritage)
        'hb-gold': '#D4874D',       // Accent Gold (Warmth)
        'hb-border': '#E8D5C0',     // Fine Border
        'hb-muted': '#8C7160',      // Muted Text
        // 기존 컬러 브릿지 (하위 호환)
        'primary': '#FBF9F4',
        'secondary': '#A03A30',
        'brand': '#3B2517',
        'warm-beige': '#F5EDE3',
      },
      fontFamily: {
        'serif-kr': ['"Noto Serif KR"', 'serif'],
        'sans-kr': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'serif': ['"Noto Serif KR"', 'serif'], // 호환성
        'sans': ['Pretendard', 'sans-serif'], // 호환성
      },
      boxShadow: {
        'premium': '0 20px 60px -15px rgba(59, 37, 23, 0.08)',
        'inner-light': 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
        'soft': '0 4px 20px rgba(59, 37, 23, 0.05)',
      },
      letterSpacing: {
        'ultra-tight': '-0.05em',
        'wide-editorial': '0.15em',
      },
    },
  },
  plugins: [],
}
