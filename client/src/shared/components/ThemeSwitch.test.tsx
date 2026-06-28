import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppTheme } from '@client/providers/ThemeProvider';
import ThemeSwitch from './ThemeSwitch';
import { useTheme } from '@client/hooks';

// `@client/hooks` is aliased to a manual mock; override per-test to drive branches.
vi.mock('@client/hooks');

const themeChange = vi.fn();
const changeAutoTheme = vi.fn();

function mockTheme(overrides: Partial<ReturnType<typeof useTheme>> = {}) {
  vi.mocked(useTheme).mockReturnValue({
    theme: AppTheme.Light,
    themeChange,
    autoTheme: true,
    changeAutoTheme,
    ...overrides,
  });
}

describe('ThemeSwitch', () => {
  beforeEach(() => {
    themeChange.mockClear();
    changeAutoTheme.mockClear();
    mockTheme();
  });

  it('shows the auto-theme icon when autoTheme is enabled', () => {
    mockTheme({ autoTheme: true });
    render(<ThemeSwitch />);

    expect(screen.getByRole('img', { name: 'skin' })).toBeInTheDocument();
  });

  it('shows the light-theme icon when a light theme is active and autoTheme is off', () => {
    mockTheme({ autoTheme: false, theme: AppTheme.Light });
    render(<ThemeSwitch />);

    expect(screen.getByRole('img', { name: 'sun' })).toBeInTheDocument();
  });

  it('shows the dark-theme icon when a dark theme is active and autoTheme is off', () => {
    mockTheme({ autoTheme: false, theme: AppTheme.Dark });
    render(<ThemeSwitch />);

    expect(screen.getByRole('img', { name: 'moon' })).toBeInTheDocument();
  });

  // The dropdown trigger shows the active-theme icon (skin when autoTheme is on).
  // Menu items are labelled only by their icons (moon/sun/skin), so we open the
  // menu and pick items by order: [0] dark, [1] light, [2] auto.
  async function openMenuItems(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('img', { name: 'skin' }));
    return screen.findAllByRole('menuitem');
  }

  it('switches to dark theme from the dropdown menu', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    const items = await openMenuItems(user);
    await user.click(items[0]);

    expect(themeChange).toHaveBeenCalledWith(AppTheme.Dark);
  });

  it('switches to light theme from the dropdown menu', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    const items = await openMenuItems(user);
    await user.click(items[1]);

    expect(themeChange).toHaveBeenCalledWith(AppTheme.Light);
  });

  it('toggles auto theme from the dropdown menu', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    const items = await openMenuItems(user);
    await user.click(items[2]);

    expect(changeAutoTheme).toHaveBeenCalledTimes(1);
  });
});
