import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { Header } from './Header';
import { SessionContext } from '@client/modules/Course/contexts';

const useActiveCourseContextMock = vi.fn();

// Course contexts depend on ahooks/SessionApi/ActiveCourseProvider; stub the
// modules Header imports so we can drive session and active course directly.
vi.mock('@client/modules/Course/contexts', async () => {
  const React = await import('react');
  return {
    SessionContext: React.createContext({ githubId: 'octocat' }),
  };
});
vi.mock('@client/modules/Course/contexts/ActiveCourseContext', () => ({
  useActiveCourseContext: () => useActiveCourseContextMock(),
}));
// Navigation links, carousel and theme switch have their own concerns/tests.
vi.mock('@client/modules/Home/data/links', () => ({
  getNavigationItems: () => [{ key: 'schedule', label: 'Schedule' }],
}));
vi.mock('@client/components/HeaderMiniBannerCarousel', () => ({
  HeaderMiniBannerCarousel: () => <div data-testid="carousel" />,
}));
vi.mock('@client/shared/components/ThemeSwitch', () => ({
  default: () => <div data-testid="theme-switch" />,
}));
vi.mock('./SolidarityUkraine', () => ({
  SolidarityUkraine: () => <div data-testid="solidarity" />,
}));

describe('Header', () => {
  beforeEach(() => {
    useActiveCourseContextMock.mockReturnValue({ course: { id: 1, name: 'JS Course' } });
    vi.mocked(useRouter).mockReturnValue({ asPath: '/' } as ReturnType<typeof useRouter>);
  });

  it('renders the logo, theme switch and horizontal navigation links', () => {
    render(<Header />);

    expect(screen.getByAltText('Rolling Scopes School Logo')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    // The menu is rendered by the same header instance and uses the same navigation item.
    // eslint-disable-next-line testing-library/no-node-access
    const menu = document.querySelector('.ant-menu-horizontal');
    expect(menu).toBeInTheDocument();
    expect(within(menu as HTMLElement).getByText('Schedule')).toBeInTheDocument();
  });

  it('shows and hides the course name with the showCourseName prop', () => {
    const { rerender } = render(<Header title="Dashboard" showCourseName />);

    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/JS Course/)).toBeInTheDocument();

    rerender(<Header title="Dashboard" />);
    expect(screen.queryByText(/JS Course/)).not.toBeInTheDocument();
  });

  it('renders the avatar dropdown and opens the profile menu on click', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const avatarButton = screen.getByRole('button');
    await user.click(avatarButton);

    expect(await screen.findByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /logout/i })).toBeInTheDocument();
  });

  it('hides the avatar dropdown when there is no logged-in session', () => {
    render(
      <SessionContext.Provider value={{} as never}>
        <Header />
      </SessionContext.Provider>,
    );

    // No githubId -> the avatar dropdown button is not rendered.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the carousel by default and hides it when showCarousel is false', () => {
    const { rerender } = render(<Header />);
    expect(screen.getByTestId('carousel')).toBeInTheDocument();

    rerender(<Header showCarousel={false} />);
    expect(screen.queryByTestId('carousel')).not.toBeInTheDocument();
  });

  it('does not pass the course to navigation links when the course id is empty', () => {
    // course.id === 0 -> courseNotEmpty is null (the `course.id ? course : null` and
    // `courseNotEmpty ?? null` falsy branches).
    useActiveCourseContextMock.mockReturnValue({ course: { id: 0, name: '' } });

    render(<Header title="Dashboard" showCourseName />);

    // No course name rendered, header still mounts.
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });

  it('marks the active menu item when the current route matches a menu link', async () => {
    // asPath === '/profile' makes `isActive` true for the Profile entry, hitting the
    // active-class branch in the dropdown menu items.
    vi.mocked(useRouter).mockReturnValue({ asPath: '/profile' } as ReturnType<typeof useRouter>);
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button'));

    const profile = await screen.findByRole('link', { name: /profile/i });
    expect(profile.className).toMatch(/menuItemActive/);
  });
});
