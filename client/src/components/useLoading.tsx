import { useCallback, useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';

type CatchHandler = (e?: unknown) => void;

type AsyncAction<T extends unknown[], K> = (...args: T) => Promise<K>;

export function useLoading(
  value = false,
  catchHandler: CatchHandler = () => {
    message.error('An unexpected error occurred. Please try later.');
  },
) {
  const actionRef = useRef<AsyncAction<unknown[], unknown>>();
  const argsRef = useRef<unknown[]>([]);
  const [initialLoading, setInitialLoading] = useState(value);

  const { loading, runAsync } = useRequest(
    async () => {
      return actionRef.current?.(...argsRef.current);
    },
    {
      manual: true,
      onError: catchHandler,
      onFinally: () => {
        setInitialLoading(false);
      },
    },
  );

  const wrapper = useCallback(
    <T extends unknown[], K = unknown>(action: AsyncAction<T, K>) =>
      async (...args: Parameters<typeof action>) => {
        actionRef.current = action as AsyncAction<unknown[], unknown>;
        argsRef.current = args;

        try {
          return (await runAsync()) as K;
        } finally {
          actionRef.current = undefined;
          argsRef.current = [];
        }
      },
    [runAsync],
  );

  return [initialLoading || loading, wrapper] as const;
}
