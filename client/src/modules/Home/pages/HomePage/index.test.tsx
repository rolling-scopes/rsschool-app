import { render, screen, fireEvent } from '@testing-library/react';
import { ReactNode, createContext, Context } from 'react';
import { HomePage } from './';
import { Course } from '@client/services/models';
import { Session } from '@client/components/withSession';
import { useStudentSummary } from '@client/modules/Home/hooks/useStudentSummary';

// --- Boundary + heavy-layout mocks -----------------------------------------

// Real React context so HomePage's `useContext(SessionContext)` returns the value
// we provide through a wrapper (no global useContext monkey-patch — that breaks antd).
// The context is created inside the (lazily-evaluated) factory and stashed on a
// hoisted holder so the test body can reference the same instance — referencing an
// outer const directly would hit a TDZ because vi.mock is hoisted above it.
const holder = vi.hoisted(() => ({ ctx: null as Context<Session> | null, useActiveCourseContext: vi.fn() }));
const { useActiveCourseContext } = holder;

vi.mock('@client/modules/Course/contexts', () => {
  holder.ctx = createContext<Session>({} as Session);
  return {
    SessionContext: holder.ctx,
    SessionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useActiveCourseContext: holder.useActiveCourseContext,
  };
});

vi.mock('@client/modules/Home/hooks/useStudentSummary', () => ({
  useStudentSummary: vi.fn(),
}));

vi.mock('@client/shared/components/Header', () => ({ Header: () => <div>HEADER</div> }));
vi.mock('@client/components/Footer', () => ({ FooterLayout: () => <div>FOOTER</div> }));
vi.mock('@client/shared/components/Sider/AdminSider', () => ({
  AdminSider: () => <div data-testid="admin-sider">ADMIN SIDER</div>,
}));

const { getAlerts, getMentor, getAllCourses } = vi.hoisted(() => ({
  getAlerts: vi.fn(),
  getMentor: vi.fn(),
  getAllCourses: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  AlertsApi: function AlertsApi() {
    return { getAlerts };
  },
}));
vi.mock('@client/services/mentorRegistry', () => ({
  MentorRegistryService: function MentorRegistryService() {
    return { getMentor };
  },
}));
vi.mock('@client/services/courses', () => ({
  CoursesService: function CoursesService() {
    return { getCourses: getAllCourses };
  },
}));

// --- Helpers ---------------------------------------------------------------

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 1,
    name: 'RS 2024',
    alias: 'rs-2024',
    completed: false,
    planned: false,
    inviteOnly: false,
    ...overrides,
  } as Course;
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return { id: 1, githubId: 'user', isAdmin: false, isHirer: false, courses: {}, ...overrides } as Session;
}

const setCourse = vi.fn();

function setContext({ course, courses = [] }: { course: Course | null; courses?: Course[] }) {
  vi.mocked(useActiveCourseContext).mockReturnValue({
    course,
    courses,
    setCourse,
    refresh: vi.fn(),
  } as any);
}

function renderHome(session: Session = makeSession()) {
  const SessionContext = holder.ctx!;
  return render(
    <SessionContext.Provider value={session}>
      <HomePage />
    </SessionContext.Provider>,
  );
}

describe('<HomePage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAlerts.mockResolvedValue({ data: [] });
    getMentor.mockResolvedValue(null);
    getAllCourses.mockResolvedValue([]);
    vi.mocked(useStudentSummary).mockReturnValue({ courseTasks: [], studentSummary: null });
  });

  it('renders the NoCourse screen when there is no active course', async () => {
    setContext({ course: null, courses: [] });
    renderHome();
    expect(await screen.findByText(/not student or mentor in any active course/i)).toBeInTheDocument();
  });

  it('renders the course selector and links when a course is active', async () => {
    setContext({ course: makeCourse(), courses: [makeCourse()] });
    renderHome();
    // CourseSelector renders a combobox; default value text shows the course name.
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByText(/not student or mentor/i)).not.toBeInTheDocument();
  });

  it('selects a different course through the selector', async () => {
    const a = makeCourse({ id: 1, name: 'RS 2024', alias: 'rs-2024' });
    const b = makeCourse({ id: 2, name: 'RS 2023', alias: 'rs-2023' });
    setContext({ course: a, courses: [a, b] });
    renderHome();

    fireEvent.mouseDown(await screen.findByRole('combobox'));
    fireEvent.click(screen.getByText('RS 2023'));

    expect(setCourse).toHaveBeenCalledWith(b);
  });

  it('fetches and shows system alerts', async () => {
    getAlerts.mockResolvedValue({ data: [{ text: 'Maintenance tonight', type: 'info' }] });
    setContext({ course: makeCourse(), courses: [makeCourse()] });
    renderHome();

    expect(await screen.findByText('Maintenance tonight')).toBeInTheDocument();
    expect(getAlerts).toHaveBeenCalledWith(true);
  });

  it('shows the admin sider for a power user', async () => {
    setContext({ course: makeCourse(), courses: [makeCourse()] });
    renderHome(makeSession({ githubId: 'mgr', courses: { 1: { roles: ['manager'] } } as any }));
    expect(await screen.findByTestId('admin-sider')).toBeInTheDocument();
  });

  it('shows the registry banner for a past mentor with an open planned course', async () => {
    const planned = makeCourse({ id: 5, name: 'Upcoming', alias: 'up', planned: true, inviteOnly: false });
    setContext({ course: makeCourse(), courses: [makeCourse(), planned] });
    renderHome(makeSession({ githubId: 'mentor', courses: { 9: { roles: ['mentor'] } } as any }));

    expect(await screen.findByText(/looking for mentors/i)).toBeInTheDocument();
  });

  it('shows an approval alert when a preselected course is approved', async () => {
    getMentor.mockResolvedValue({ preselectedCourses: [7] });
    const approved = makeCourse({ id: 7, name: 'Approved Course', alias: 'apr' });
    getAllCourses.mockResolvedValue([approved]);
    setContext({ course: makeCourse(), courses: [makeCourse()] });
    renderHome();

    expect(await screen.findByText(/approved as a mentor to "Approved Course"/i)).toBeInTheDocument();
    // antd renders Button with href as an anchor (role="link").
    const confirm = await screen.findByRole('link', { name: /confirm participation/i });
    expect(confirm).toHaveAttribute('href', '/course/mentor/confirm?course=apr');
  });
});
