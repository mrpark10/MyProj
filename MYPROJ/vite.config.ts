/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages 프로젝트 페이지 경로 (예: https://<user>.github.io/MyProj/)
const GH_PAGES_REPO = 'MyProj';

// AlgoVisualizer AI — Vite 설정
// - '@' 경로 별칭을 src 로 매핑 (tsconfig 의 paths 와 동기화 필수)
// - base: 일반 빌드는 상대 경로('./')로 어디에 배포해도 안전하게 동작하고,
//   `npm run build:gh-pages` (mode=gh-pages) 로 빌드하면 GitHub Pages 프로젝트 경로에 맞춘다.
// - Vitest: 알고리즘 스텝 생성기 단위 테스트는 순수 Node 환경에서 실행
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'gh-pages' ? `/${GH_PAGES_REPO}/` : './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 3D 렌더링 라이브러리를 별도 청크로 분리해 초기 로딩과 캐싱을 개선한다.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
}));
