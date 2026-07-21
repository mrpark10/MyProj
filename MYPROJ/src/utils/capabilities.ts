/**
 * 브라우저 기능 탐지.
 * WebGL 을 지원하지 않는 환경(구형 브라우저, GPU 비활성, 원격 데스크톱 등)에서
 * 3D 씬을 띄우다 앱이 죽는 것을 막고 2D 로 자동 전환하기 위해 사용한다.
 */

let cached: boolean | null = null;

/** WebGL(1 또는 2) 컨텍스트를 만들 수 있는지 확인한다. 결과는 캐시된다. */
export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached;

  // SSR / 테스트 환경 가드
  if (typeof document === 'undefined') {
    cached = false;
    return cached;
  }

  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    cached = context !== null;
  } catch {
    // 일부 환경에서는 컨텍스트 생성 자체가 예외를 던진다.
    cached = false;
  }

  return cached;
}
