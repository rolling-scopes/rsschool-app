import { render, screen, act, waitFor } from '@testing-library/react';
import { notification } from 'antd';
import { ActiveCourseProvider, useActiveCourseContext } from './ActiveCourseContext';
import { useRouter } from 'next/router';
import useRequest from 'ahooks/lib/useRequest';
import { useLocalStorage } from 'react-use';
import { ProfileCourseDto } from '@client/api';

vi.mock('ahooks/lib/useRequest');
vi.mock('react-use', async () => ({
  ...(await vi.importActual('react-use')),
  useLocalStorage: vi.fn(),
}));

// WelcomeCard pulls in antd Image/Layout; render a marker instead.
vi.mock('@client/components/WelcomeCard', () => ({
  WelcomeCard: () => <div>Welcome Card</div>,
}));

const getCourses = vi.fn();
vi.mock('@client/services/user', () => ({
  UserService: function UserService() {
    return { getCourses };
  },
}));

// A small consumer so we can assert the provided context value reaches children.
function Consumer() {
  const { course, courses } = useActiveCourseContext();
  return (
    <div>
      <span data-testid="active">{course?.alias}</span>
      <span data-testid="count">{courses.length}</span>
    </div>
  );
}

const course1 = { id: 1, alias: 'rs-2024', name: 'RS 2024' } as ProfileCourseDto;
const course2 = { id: 2, alias: 'rs-2023', name: 'RS 2023' } as ProfileCourseDto;

const setStorage = vi.fn();

function mockRouter(overrides: Record<string, unknown> = {}) {
  vi.mocked(useRouter).mockReturnValue({
    query: {},
    pathname: '/course',
    isReady: true,
    push: vi.fn(),
    ...overrides,
  } as any);
}

// Mock useRequest to return resolved data synchronously and fire onSuccess on the
// next microtask (after mount), so the component's setCourse useCallback is initialized.
function mockResolved(data: unknown) {
  vi.mocked(useRequest).mockImplementation((_fn, options: any) => {
    queueMicrotask(() => act(() => options?.onSuccess?.(data)));
    return { data, loading: false, refresh: vi.fn() } as any;
  });
}

// Capture the resolver passed to useRequest so it can be invoked directly, and fire onError.
function mockError(error: unknown) {
  vi.mocked(useRequest).mockImplementation((_fn, options: any) => {
    queueMicrotask(() => act(() => options?.onError?.(error)));
    return { data: undefined, loading: false, refresh: vi.fn() } as any;
  });
}

describe('<ActiveCourseProvider />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocalStorage).mockReturnValue([undefined, setStorage, vi.fn()]);
    mockRouter();
  });

  it('renders children directly on a public route once the router is ready', () => {
    mockRouter({ pathname: '/public/login', isReady: true });
    vi.mocked(useRequest).mockReturnValue({ data: undefined, loading: false, refresh: vi.fn() } as any);

    render(
      <ActiveCourseProvider publicRoutes={['/public/login']}>
        <div>Public Child</div>
      </ActiveCourseProvider>,
    );

    expect(screen.getByText('Public Child')).toBeInTheDocument();
  });

  it('shows the loading screen while resolving the course', () => {
    vi.mocked(useRequest).mockReturnValue({ data: undefined, loading: true, refresh: vi.fn() } as any);

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Hidden Child</div>
      </ActiveCourseProvider>,
    );

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();
  });

  it('renders the welcome card when the user belongs to no course', async () => {
    // data resolves to [null, []] -> data[0] === null -> WelcomeCard.
    mockResolved([null, []]);

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Child</div>
      </ActiveCourseProvider>,
    );

    expect(await screen.findByText('Welcome Card')).toBeInTheDocument();
  });

  it('provides the resolved course and list to children', async () => {
    mockResolved([course1, [course1, course2]]);

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <Consumer />
      </ActiveCourseProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('rs-2024'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    // setCourse persists the active course id in local storage.
    expect(setStorage).toHaveBeenCalledWith('1');
  });

  it('shows a no-access alert when the alias does not match the active course', async () => {
    mockRouter({ query: { course: 'other-alias' }, pathname: '/course', isReady: true });
    mockResolved([course1, [course1]]);

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Child</div>
      </ActiveCourseProvider>,
    );

    expect(await screen.findByText(/Probably you do not participate in the course/i)).toBeInTheDocument();
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('redirects to login without a toast on a 401 error', async () => {
    const push = vi.fn();
    mockRouter({ push });
    const notifySpy = vi.spyOn(notification, 'error').mockImplementation(() => {});
    mockError({ status: 401 });

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Child</div>
      </ActiveCourseProvider>,
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith('/login', expect.objectContaining({ pathname: '/login' })));
    expect(notifySpy).not.toHaveBeenCalled();
  });

  it('redirects to login and shows a toast on a non-401 error', async () => {
    const push = vi.fn();
    mockRouter({ push });
    const notifySpy = vi.spyOn(notification, 'error').mockImplementation(() => {});
    mockError({ status: 500 });

    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Child</div>
      </ActiveCourseProvider>,
    );

    await waitFor(() =>
      expect(notifySpy).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) })),
    );
    expect(push).toHaveBeenCalledWith('/login', expect.anything());
  });
});

describe('resolveCourse (via the resolver passed to useRequest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocalStorage).mockReturnValue([undefined, setStorage, vi.fn()]);
    mockRouter();
  });

  function captureResolver() {
    let resolver: (() => Promise<unknown>) | undefined;
    vi.mocked(useRequest).mockImplementation((fn: any) => {
      resolver = fn;
      return { data: undefined, loading: true, refresh: vi.fn() } as any;
    });
    render(
      <ActiveCourseProvider publicRoutes={[]}>
        <div>Child</div>
      </ActiveCourseProvider>,
    );
    return resolver!;
  }

  it('picks the course matching the route alias first', async () => {
    mockRouter({ query: { course: 'rs-2023' } });
    getCourses.mockResolvedValue([course1, course2]);
    const [course, courses] = (await captureResolver()()) as [ProfileCourseDto, ProfileCourseDto[]];
    expect(course).toEqual(course2);
    expect(courses).toHaveLength(2);
  });

  it('falls back to the stored course id, then the first course', async () => {
    vi.mocked(useLocalStorage).mockReturnValue(['2', setStorage, vi.fn()]);
    getCourses.mockResolvedValue([course1, course2]);
    const [course] = (await captureResolver()()) as [ProfileCourseDto];
    expect(course).toEqual(course2);
  });

  it('resolves to null when the user has no courses', async () => {
    getCourses.mockResolvedValue([]);
    const [course, courses] = (await captureResolver()()) as [ProfileCourseDto | null, ProfileCourseDto[]];
    expect(course).toBeNull();
    expect(courses).toEqual([]);
  });
});

describe('useActiveCourseContext default', () => {
  it('exposes empty defaults outside a provider', () => {
    let captured: ReturnType<typeof useActiveCourseContext> | undefined;
    function Probe() {
      captured = useActiveCourseContext();
      return null;
    }
    render(<Probe />);
    expect(captured?.courses).toEqual([]);
    // default setCourse/refresh are no-ops and should not throw.
    expect(() => captured?.refresh()).not.toThrow();
  });
});
