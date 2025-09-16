import { useState } from 'react';
import { message } from 'antd';

type CatchHandler = (e?: unknown) => void;

export function useLoading(
  value = false,
  catchHandler: CatchHandler = () => {
    message.error('An unexpected error occurred. Please try later.');
  },
) {
  const [loading, setLoading] = useState(value);
  const wrapper =
    <T extends unknown[], K = unknown>(action: (...args: T) => Promise<K>) =>
    async (...args: Parameters<typeof action>) => {
      try {
        setLoading(true);
        return await action(...args);
      } catch (e) {
        catchHandler(e);
      } finally {
        setLoading(false);
      }
    };
  return [loading, wrapper] as const;
}
