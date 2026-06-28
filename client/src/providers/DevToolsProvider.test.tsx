import { render, screen } from '@testing-library/react';
import { DevToolsProvider } from './DevToolsProvider';

vi.mock('@client/components/DevTools', () => ({
  DevToolsContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dev-tools-container">{children}</div>
  ),
}));

describe('DevToolsProvider', () => {
  const originalEnv = process.env.RSSCHOOL_DEV_TOOLS;

  afterEach(() => {
    process.env.RSSCHOOL_DEV_TOOLS = originalEnv;
  });

  it('renders only the children (no container) when dev tools are disabled', () => {
    process.env.RSSCHOOL_DEV_TOOLS = 'false';

    render(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    expect(screen.getByText('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools-container')).not.toBeInTheDocument();
  });

  it('renders only the children when the env var is unset', () => {
    delete process.env.RSSCHOOL_DEV_TOOLS;

    render(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    expect(screen.getByText('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools-container')).not.toBeInTheDocument();
  });

  it('wraps the children with the DevToolsContainer when dev tools are enabled', () => {
    process.env.RSSCHOOL_DEV_TOOLS = 'true';

    render(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    const container = screen.getByTestId('dev-tools-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('app-content');
  });
});
