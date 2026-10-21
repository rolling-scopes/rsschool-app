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

  it('renders the container only when dev tools are enabled', () => {
    process.env.RSSCHOOL_DEV_TOOLS = 'false';

    const { rerender } = render(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    expect(screen.getByText('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools-container')).not.toBeInTheDocument();

    delete process.env.RSSCHOOL_DEV_TOOLS;
    rerender(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    expect(screen.getByText('app-content')).toBeInTheDocument();
    expect(screen.queryByTestId('dev-tools-container')).not.toBeInTheDocument();

    process.env.RSSCHOOL_DEV_TOOLS = 'true';
    rerender(
      <DevToolsProvider>
        <div>app-content</div>
      </DevToolsProvider>,
    );

    const container = screen.getByTestId('dev-tools-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('app-content');
  });
});
