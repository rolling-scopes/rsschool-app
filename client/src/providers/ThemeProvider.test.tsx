import { useContext } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeContext, ThemeProvider, AppTheme } from './ThemeProvider';

function setMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    // legacy
    addListener: (cb: () => void) => listeners.add(cb),
    removeListener: (cb: () => void) => listeners.delete(cb),
    dispatch: () => listeners.forEach(cb => cb()),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return mql;
}

function Consumer() {
  const { theme, themeChange, autoTheme, changeAutoTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="auto">{String(autoTheme)}</span>
      <button onClick={() => themeChange(AppTheme.Dark)}>set-dark</button>
      <button onClick={() => themeChange(AppTheme.Light)}>set-light</button>
      <button onClick={() => changeAutoTheme()}>toggle-auto</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    setMatchMedia(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exposes safe no-op defaults when read without a provider', () => {
    let ctx: React.ContextType<typeof ThemeContext> | undefined;
    function BareConsumer() {
      ctx = useContext(ThemeContext);
      return null;
    }
    render(<BareConsumer />);

    expect(ctx?.theme).toBe(AppTheme.Light);
    expect(ctx?.autoTheme).toBe(true);
    // the default handlers are no-ops and must not throw
    expect(() => ctx?.themeChange(AppTheme.Dark)).not.toThrow();
    expect(() => ctx?.changeAutoTheme()).not.toThrow();
  });

  it('defaults to auto mode following the system (light) when nothing is stored', () => {
    setMatchMedia(false);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('auto')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('defaults to auto mode following the system (dark) when nothing is stored', () => {
    setMatchMedia(true);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('auto')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('themeChange to dark applies the dark theme, body class, and persists it', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText('set-dark'));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.body).toHaveClass(AppTheme.Dark);
    expect(document.body).not.toHaveClass(AppTheme.Light);
    expect(localStorage.getItem('app-theme')).toBe('dark');
    expect(screen.getByTestId('auto')).toHaveTextContent('false');
  });

  it('themeChange to light replaces dark body class with light', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText('set-dark'));
    fireEvent.click(screen.getByText('set-light'));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.body).toHaveClass(AppTheme.Light);
    expect(document.body).not.toHaveClass(AppTheme.Dark);
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('restores a valid stored theme on mount', () => {
    localStorage.setItem('app-theme', AppTheme.Dark);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('auto')).toHaveTextContent('false');
  });

  it('enables auto mode for a legacy stored "auto" value and follows system (dark)', () => {
    // "auto" is no longer written to storage, but users upgraded from the old build may still
    // have it. It is not a valid AppTheme, so it falls through to the auto (follow-system) branch.
    localStorage.setItem('app-theme', 'auto');
    setMatchMedia(true);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('auto')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('toggling auto on clears the stored theme and applies the system (light) theme', () => {
    // Start from an explicit manual theme so auto is off, then toggle it on.
    localStorage.setItem('app-theme', AppTheme.Dark);
    setMatchMedia(false);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('auto')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('toggle-auto'));

    expect(screen.getByTestId('auto')).toHaveTextContent('true');
    expect(localStorage.getItem('app-theme')).toBeNull();
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('toggling auto off then on flips the auto flag', () => {
    // Start from an explicit manual theme so auto is off initially.
    localStorage.setItem('app-theme', AppTheme.Light);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('auto')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('toggle-auto'));
    expect(screen.getByTestId('auto')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('toggle-auto'));
    expect(screen.getByTestId('auto')).toHaveTextContent('false');
  });

  it('responds to system theme changes while auto mode is active', () => {
    // Nothing stored → auto mode is on by default and subscribed to the media query.
    const mql = setMatchMedia(false);
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('auto')).toHaveTextContent('true');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    act(() => {
      mql.matches = true;
      mql.dispatch();
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});
