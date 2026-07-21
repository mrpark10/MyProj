/**
 * 렌더링 에러 바운더리.
 *
 * CLAUDE.md 규칙 5 대응: 하위 컴포넌트(특히 WebGL/3D 씬)에서 예외가 발생해도
 * 앱 전체가 하얗게 뜨지 않도록 대체 UI 를 보여준다.
 * React 에서 에러 바운더리는 클래스 컴포넌트로만 구현할 수 있다.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** 에러 발생 시 보여줄 대체 UI. 함수면 에러를 인자로 받는다. */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** 에러 발생 시 부모에게 알린다 (예: 3D → 2D 자동 전환) */
  onError?: (error: Error) => void;
  /** 이 값이 바뀌면 에러 상태를 초기화한다 */
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** 최상위 에러 대체 화면 — Tailwind 로딩 실패까지 가정해 인라인 스타일을 쓴다. */
export function RootErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center' }}>
      <h1 style={{ margin: 0, fontSize: 20, color: '#fca5a5' }}>앱을 시작하지 못했습니다</h1>
      <p style={{ margin: 0, maxWidth: 520, fontSize: 13, lineHeight: 1.6, color: '#94a3b8' }}>{error.message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{ marginTop: 8, borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        새로고침
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] 렌더링 중 오류가 발생했습니다.', error, info.componentStack);
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // resetKey 가 바뀌면(예: 다른 알고리즘 선택) 다시 렌더를 시도한다.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;

    if (typeof fallback === 'function') return fallback(error, this.reset);
    if (fallback !== undefined) return fallback;

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm font-semibold text-rose-300">화면을 표시하는 중 오류가 발생했습니다.</p>
        <p className="max-w-md text-xs text-slate-400">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
        >
          다시 시도
        </button>
      </div>
    );
  }
}
