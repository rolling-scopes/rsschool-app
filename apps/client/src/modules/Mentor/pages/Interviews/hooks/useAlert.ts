import { useCallback } from 'react';
import { useSessionStorage } from 'react-use';

export function useAlert(key: string) {
  const [isDismissed, setIsDismissed] = useSessionStorage(key, false);

  const setDismissed = useCallback(() => setIsDismissed(true), [setIsDismissed]);

  return [isDismissed, setDismissed] as const;
}
