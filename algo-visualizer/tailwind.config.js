/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ⚠️ 'base' 라는 이름은 쓰지 말 것.
        // Tailwind 내장 폰트 크기 유틸리티 text-base 를 색상 유틸리티가 덮어써서
        // 글자가 배경색(#0b1020)으로 칠해져 보이지 않게 된다.
        surface: '#0b1020',
        panel: '#141b32',
        line: '#243055',
        accent: '#6366f1',
      },
    },
  },
  plugins: [],
};
