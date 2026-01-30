import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { MessageProvider } from './MessageProvider';
import { DevToolsProvider } from './DevToolsProvider';

type Props = { children: ReactNode };
type Provider = (props: Props) => ReactNode;

const isDev = process.env.NODE_ENV === 'development';

function composeProviders(...providers: Provider[]): Provider {
  return providers.reduceRight<Provider>(
    (Acc, P) =>
      ({ children }: Props) => (
        <P>
          <Acc>{children}</Acc>
        </P>
      ),
    ({ children }: Props) => <>{children}</>,
  );
}

export const Providers = composeProviders(ThemeProvider, MessageProvider, ...(isDev ? [DevToolsProvider] : []));
