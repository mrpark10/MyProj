/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// AlgoVisualizer AI — Vite 설정
// - '@' 경로 별칭을 src 로 매핑 (tsconfig 의 paths 와 동기화 필수)
// - Vitest: 알고리즘 스텝 생성기 단위 테스트는 순수 Node 환경에서 실행
export default defineConfig({
  plugins: [react()],
  // 상대 경로로 에셋을 참조해, 빌드 결과(dist)를 하위 경로나 파일로 열어도 깨지지 않게 한다.
  base: './',
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
});
