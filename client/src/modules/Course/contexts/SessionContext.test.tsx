import { render, screen } from '@testing-library/react';
import { SessionProvider } from './';
import Router from 'next/router';
import { useActiveCourseContext } from './ActiveCourseContext';
import useRequest from 'ahooks/lib/useRequest';

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
});
