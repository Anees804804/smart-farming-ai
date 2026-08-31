import { useState, useCallback } from 'react';
import api from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (config?: { method?: string; body?: unknown }) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await api.request<T>({
          url,
          method: config?.method || 'GET',
          data: config?.body,
        });
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [url]
  );

  return { ...state, execute };
}
