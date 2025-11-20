import { useState, useCallback } from 'react';

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook para manejar operaciones async con estados de loading/error/success
 * Útil para formularios, uploads, etc.
 */
export function useAsyncOperation<T = void>() {
  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setState({ isLoading: true, error: null, success: false });
        const result = await asyncFn();
        setState({ isLoading: false, error: null, success: true });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido';
        setState({ isLoading: false, error, success: false });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook para manejar múltiples operaciones async en paralelo
 */
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncOperationState>>(
    new Map()
  );

  const execute = useCallback(
    async <T,>(key: string, asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setOperations((prev) => new Map(prev).set(key, { isLoading: true, error: null, success: false }));
        const result = await asyncFn();
        setOperations((prev) => new Map(prev).set(key, { isLoading: false, error: null, success: true }));
        return result;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Error desconocido';
        setOperations((prev) => new Map(prev).set(key, { isLoading: false, error, success: false }));
        return null;
      }
    },
    []
  );

  const getState = useCallback((key: string): AsyncOperationState | undefined => {
    return operations.get(key);
  }, [operations]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setOperations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      setOperations(new Map());
    }
  }, []);

  return {
    execute,
    getState,
    reset,
    all: operations,
  };
}
