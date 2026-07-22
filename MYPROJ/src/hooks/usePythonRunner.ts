/**
 * Python 실습 코드 실행 훅.
 *
 * CLAUDE.md 규칙 2 대응: Worker 와 타임아웃 타이머는 useRef 로 보관하고,
 * 언마운트 시 반드시 정리(terminate/clearTimeout)해 리소스 누수를 막는다.
 *
 * 실제 실행은 별도 Worker(public/pyodideWorker.js)에서 이뤄지므로,
 * 학생 코드가 무한루프여도 메인 스레드/화면은 멈추지 않는다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const RUN_TIMEOUT_MS = 15000;

export type RunStatus = 'idle' | 'running' | 'success' | 'error' | 'timeout';

interface WorkerResponse {
  type: 'success' | 'error';
  output: string;
  message?: string;
}

export interface PythonRunner {
  status: RunStatus;
  output: string;
  errorMessage: string | null;
  run: (code: string) => void;
}

export function usePythonRunner(): PythonRunner {
  const [status, setStatus] = useState<RunStatus>('idle');
  const [output, setOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /** 응답 없는 워커(무한루프 등)를 강제 종료하고 다음 실행을 위해 새 워커를 준비한다. */
  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  // 언마운트 시 워커·타이머 정리
  useEffect(() => {
    return () => {
      clearTimer();
      terminateWorker();
    };
  }, [clearTimer, terminateWorker]);

  const run = useCallback(
    (code: string) => {
      // 이전 실행이 아직 응답 없으면 강제 종료 후 새로 시작한다.
      terminateWorker();
      clearTimer();

      setStatus('running');
      setOutput('');
      setErrorMessage(null);

      const worker = new Worker('/pyodideWorker.js');
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        clearTimer();
        const { type, output: workerOutput, message } = event.data;
        setOutput(workerOutput);
        if (type === 'success') {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(message ?? '알 수 없는 오류가 발생했습니다.');
        }
      };

      worker.onerror = () => {
        clearTimer();
        setStatus('error');
        setErrorMessage('Python 실행 환경을 불러오는 데 실패했습니다. 네트워크 연결을 확인해 주세요.');
        terminateWorker();
      };

      worker.postMessage({ code });

      timeoutRef.current = window.setTimeout(() => {
        setStatus('timeout');
        setErrorMessage(`실행 시간이 ${RUN_TIMEOUT_MS / 1000}초를 초과해 중단했습니다. 무한 루프가 없는지 확인해 주세요.`);
        terminateWorker();
      }, RUN_TIMEOUT_MS);
    },
    [clearTimer, terminateWorker],
  );

  return { status, output, errorMessage, run };
}
