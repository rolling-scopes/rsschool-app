import { useState } from 'react';
import { message } from 'antd';

export function useLoading(
  value = false,
  catchHandler = (_: Error): void => {
    message.error('An unexpected error occured. Please try later.');
  },
) {
  const [loading, setLoading] = useState(value);
  const wrapper =
    <T extends any[], K = any>(action: (...args: T) => Promise<K>) =>
    async (...args: Parameters<typeof action>) => {
      try {
        setLoading(true);
        return await action(...args);
      } catch (e) {
        catchHandler(e as Error);
      } finally {
        setLoading(false);
      }
    };
  return [loading, wrapper] as const;
}
