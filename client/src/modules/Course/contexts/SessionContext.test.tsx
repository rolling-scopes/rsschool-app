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

  it('renders loading and uses the SessionApi fetcher', async () => {
    const getSession = vi.spyOn(SessionApi.prototype, 'getSession').mockResolvedValue({
      data: mockSession,
    } as never);
    vi.mocked(useRequest).mockReturnValue({ loading: true });
    render(<SessionProvider>{mockChildren}</SessionProvider>);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    const fetcher = vi.mocked(useRequest).mock.calls[0][0] as () => Promise<unknown>;
    await expect(fetcher()).resolves.toEqual(mockSession);
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it('should handle error and redirect to login', () => {
    vi.mocked(useRequest).mockReturnValue({ error: true });
    render(<SessionProvider>{mockChildren}</SessionProvider>);
    expect(Router.push).toHaveBeenCalledWith('/login', expect.anything());
  });

  it('allows admin-only pages for admins and denies other users', () => {
    vi.mocked(useRequest).mockReturnValue({ data: mockSession });
    const { rerender } = render(<SessionProvider adminOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();

    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false } });
    rerender(<SessionProvider adminOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();
  });

  it('checks active-course roles and any-course power-user access', () => {
    vi.mocked(useRequest).mockReturnValue({ data: mockSession });
    const { rerender } = render(<SessionProvider allowedRoles={['student']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();

    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false } });
    rerender(<SessionProvider allowedRoles={['mentor']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();

    vi.mocked(useRequest).mockReturnValue({ data: { isAdmin: false, courses: {} } });
    rerender(<SessionProvider allowedRoles={['mentor']}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();

    vi.mocked(useRequest).mockReturnValue({
      data: { isAdmin: false, courses: { 2: { roles: ['mentor'] } } },
    });
    rerender(
      <SessionProvider allowedRoles={['mentor']} anyCoursePowerUser={true}>
        {mockChildren}
      </SessionProvider>,
    );
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('renders the AccessDenied warning with a working "Go Back" button', async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<AccessDeniedWarning />);

    await user.click(screen.getByRole('button', { name: /go back/i }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('checks hirer-only access for non-hirers and hirers', () => {
    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false, isHirer: false } });
    const { rerender } = render(<SessionProvider hirerOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText(/You don't have required role to access this page/)).toBeInTheDocument();

    vi.mocked(useRequest).mockReturnValue({ data: { ...mockSession, isAdmin: false, isHirer: true } });
    rerender(<SessionProvider hirerOnly={true}>{mockChildren}</SessionProvider>);
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
