import { ReactNode } from 'react';
import { DevToolsContainer } from '@client/components/DevTools';

export function DevToolsProvider({ children }: { children: ReactNode }) {
  const devToolsToggle = process.env.RSSCHOOL_DEV_TOOLS === 'true';
  if (!devToolsToggle) return <>{children}</>;
  return <DevToolsContainer>{children}</DevToolsContainer>;
}
