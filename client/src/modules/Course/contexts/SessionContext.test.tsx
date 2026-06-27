import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider, AccessDeniedWarning } from './';
import Router from 'next/router';
import { useActiveCourseContext } from './ActiveCourseContext';
import useRequest from 'ahooks/lib/useRequest';
import { SessionApi } from '@client/api';

vi.mock('next/router', () => ({ default: { push: vi.fn() }, push: vi.fn() }));
vi.mock('./ActiveCourseContext', () => ({
  useActiveCourseContext: vi.fn(),
}));

vi.mock('ahooks/lib/useRequest');

describe('<SessionProvider />', () => {
  const mockChildren = <div>Child Component</div>;

  const mockSession = { isAdmin: true, courses: { 1: { roles: ['student'] } } };
  const mockCourse = { id: 1 };
  const mockActiveCourse = { course: mockCourse };

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.mocked(useActiveCourseContext).mockReturnValue(mockActiveCourse);
  });

  it('should render loading screen', () => {
    vi.mocked(useRequest).mockReturnValue({ loading: true });
    render(<SessionProvider>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error and redirect to login', () => {
    vi.mocked(useRequest).mockReturnValue({ error: true });
    render(<SessionProvider>{mockChildren}</SessionProvider>);
    expect(Router.push).toHaveBeenCalledWith('/login', expect.anything());
  });

  it('should render children for admin user for admin-only pages', () => {
    vi.mocked(useRequest).mockReturnValue({ data: mockSession });
    render(<SessionProvider adminOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should render warning for non-admin user for admin-only pages', () => {
    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false } });
    render(<SessionProvider adminOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();
  });

  it('should render children for user with allowed roles', () => {
    vi.mocked(useRequest).mockReturnValue({ data: mockSession });
    render(<SessionProvider allowedRoles={['student']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('should render warning for user without allowed roles', () => {
    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false } });
    render(<SessionProvider allowedRoles={['mentor']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();
  });

  it('fetches the session via SessionApi.getSession in the useRequest fetcher', async () => {
    const getSession = vi.spyOn(SessionApi.prototype, 'getSession').mockResolvedValue({
      data: mockSession,
    } as never);
    vi.mocked(useRequest).mockReturnValue({ loading: true });
    render(<SessionProvider>{mockChildren}</SessionProvider>);

    // Capture the fetcher passed to useRequest and invoke it to exercise getSession().
    const fetcher = vi.mocked(useRequest).mock.calls[0][0] as () => Promise<unknown>;
    await expect(fetcher()).resolves.toEqual(mockSession);
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it('renders the AccessDenied warning with a working "Go Back" button', async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<AccessDeniedWarning />);

    await user.click(screen.getByRole('button', { name: /go back/i }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('denies access to a hirer-only page for a non-hirer, non-admin user', () => {
    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false, isHirer: false } });
    render(<SessionProvider hirerOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();
  });

  it('allows a hirer-only page for a hirer user', () => {
    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false, isHirer: true } });
    render(<SessionProvider hirerOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('falls back to no roles when the current course is absent from the session', () => {
    // Non-admin, allowedRoles set, but session.courses has no entry for the active course id
    // → `courses?.[id]?.roles ?? []` resolves to [] and access is denied.
    vi.mocked(useRequest).mockReturnValue({ data: { isAdmin: false, courses: {} } });
    render(<SessionProvider allowedRoles={['mentor']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();
  });

  it('grants access to a power user when anyCoursePowerUser is enabled (role in another course)', () => {
    // No role in the active course (id 1), but the user is a mentor in another course (id 2),
    // and anyCoursePowerUser lets that count → access granted.
    vi.mocked(useRequest).mockReturnValue({
      data: { isAdmin: false, courses: { 2: { roles: ['mentor'] } } },
    });
    render(
      <SessionProvider allowedRoles={['mentor']} anyCoursePowerUser={true}>
        {mockChildren}
      </SessionProvider>,
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
