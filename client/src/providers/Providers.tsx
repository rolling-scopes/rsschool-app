import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { MessageProvider } from './MessageProvider';
import { DevToolsProvider } from './DevToolsProvider';

type Props = { children: ReactNode };
type Provider = (props: Props) => ReactNode;

const devToolsToggle = process.env.RSSCHOOL_DEV_TOOLS === 'true';

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

export const Providers = composeProviders(
  ThemeProvider,
  MessageProvider,
  ...(devToolsToggle ? [DevToolsProvider] : []),
);
