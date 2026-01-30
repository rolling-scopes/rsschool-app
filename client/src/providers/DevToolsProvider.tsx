import { ReactNode } from 'react';
import { DevToolsContainer } from '@client/components/DevTools';

export function DevToolsProvider({ children }: { children: ReactNode }) {
  return <DevToolsContainer>{children}</DevToolsContainer>;
}
