import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ErrorBoundary, RootErrorFallback } from '@/components/ErrorBoundary';
import '@/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root 엘리먼트를 찾을 수 없습니다.');
}

// 최상위 에러 바운더리 — 어떤 예외가 나도 백지 대신 원인을 보여준다.
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary fallback={(error) => <RootErrorFallback error={error} />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
