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

  it('shows the icon for auto, light, and dark themes', () => {
    mockTheme({ autoTheme: true });
    const { rerender } = render(<ThemeSwitch />);

    expect(screen.getByRole('img', { name: 'skin' })).toBeInTheDocument();

    mockTheme({ autoTheme: false, theme: AppTheme.Light });
    rerender(<ThemeSwitch />);
    expect(screen.getByRole('img', { name: 'sun' })).toBeInTheDocument();

    mockTheme({ autoTheme: false, theme: AppTheme.Dark });
    rerender(<ThemeSwitch />);
    expect(screen.getByRole('img', { name: 'moon' })).toBeInTheDocument();
  });

  // The dropdown trigger shows the active-theme icon (skin when autoTheme is on).
  // Menu items are labelled only by their icons (moon/sun/skin), so we open the
  // menu and pick items by order: [0] dark, [1] light, [2] auto.
  async function openMenuItems(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('img', { name: 'skin' }));
    return screen.findAllByRole('menuitem');
  }

  it('switches among dark, light, and automatic themes', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch />);

    let items = await openMenuItems(user);
    await user.click(items[0]);
    expect(themeChange).toHaveBeenCalledWith(AppTheme.Dark);

    items = await openMenuItems(user);
    await user.click(items[1]);
    expect(themeChange).toHaveBeenCalledWith(AppTheme.Light);

    items = await openMenuItems(user);
    await user.click(items[2]);
    expect(changeAutoTheme).toHaveBeenCalledTimes(1);
  });
});
