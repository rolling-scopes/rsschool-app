import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
import { ComponentType } from 'react';

export const dynamicWithSkeleton = <T extends object>(
  importFn: () => Promise<ComponentType<T> | { default: ComponentType<T> }>,
): ComponentType<T> => {
  return dynamic(importFn, {
    ssr: false,
    loading: () => <Skeleton active={true} />,
  });
};
