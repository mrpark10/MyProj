/**
 * Python 실습 코드 실행 워커.
 *
 * 별도 Worker 스레드에서 Pyodide(WASM CPython)를 로드해 실행하므로,
 * 학생이 무한루프를 작성해도 메인 UI 스레드는 절대 멈추지 않는다.
 * (React 컴포넌트는 usePythonRunner 훅에서 타임아웃 시 이 워커를 강제 종료한다.)
 *
 * 순수 JS(모듈 아님)로 작성해 Vite 번들링을 거치지 않고 public/ 에서 그대로 서빙된다.
 */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');

let pyodideReadyPromise = null;

function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { code } = event.data;
  let output = '';

  try {
    const pyodide = await getPyodide();

    pyodide.setStdout({
      batched: (msg) => {
        output += msg + '\n';
      },
    });
    pyodide.setStderr({
      batched: (msg) => {
        output += msg + '\n';
      },
    });

    await pyodide.runPythonAsync(code);
    self.postMessage({ type: 'success', output });
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    self.postMessage({ type: 'error', output, message });
  }
};
