import { render, screen, fireEvent } from '@testing-library/react';
import { ReactNode, createContext } from 'react';
import CourseStatistic from './CourseStatistics';

// --- Boundary & collaborator mocks -----------------------------------------

// PageLayout pulls in the header/session/theme tree; replace with a passthrough that
// surfaces the title and children so we assert the page's title + content branches.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Real React context for SessionContext (default value drives isAdmin); plus active course.
const { mockSession } = vi.hoisted(() => ({ mockSession: { isAdmin: true } }));
vi.mock('@client/modules/Course/contexts', () => ({
  SessionContext: createContext(mockSession),
  useActiveCourseContext: () => ({ course: { id: 42, alias: 'rs-2025' } }),
}));

// Data hook: control loading and returned aggregate.
const { useCoursesStats } = vi.hoisted(() => ({
  useCoursesStats: vi.fn(() => ({ loading: false, coursesData: undefined })),
}));
vi.mock('../hooks', () => ({ useCoursesStats }));

// Child components → markers so we assert which branch renders and the scope wiring.
vi.mock('../components/StatScopeSelector', () => ({
  StatScopeSelector: ({
    statScope,
    handleStatScope,
    handleYearSelection,
  }: {
    statScope: string;
    handleStatScope: (v: boolean) => void;
    handleYearSelection: (d: { year: () => number } | null) => void;
  }) => (
    <div data-testid="scope-selector" data-scope={statScope}>
      <button type="button" onClick={() => handleStatScope(true)}>
        to-current
      </button>
      <button type="button" onClick={() => handleStatScope(false)}>
        to-timeline
      </button>
      <button type="button" onClick={() => handleYearSelection({ year: () => 2024 })}>
        pick-year
      </button>
    </div>
  ),
}));
vi.mock('../components/StatCards', () => ({
  StatCards: ({ coursesData }: { coursesData?: unknown }) => (
    <div data-testid="stat-cards" data-has-data={String(Boolean(coursesData))} />
  ),
}));

// next/navigation router + search params.
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
const { searchParamsValue } = vi.hoisted(() => ({ searchParamsValue: { value: '' } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(searchParamsValue.value),
}));

describe('<CourseStatistic />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.isAdmin = true;
    searchParamsValue.value = '';
    useCoursesStats.mockReturnValue({ loading: false, coursesData: undefined });
  });

  it('defaults to Timeline scope (plural title) with no course query param', () => {
    render(<CourseStatistic />);

    expect(screen.getByRole('heading', { name: 'Courses Statistics' })).toBeInTheDocument();
    expect(screen.getByTestId('scope-selector')).toHaveAttribute('data-scope', 'Timeline');
  });

  it('shows the Empty state on Timeline scope when no year is selected', () => {
    render(<CourseStatistic />);

    expect(screen.getByText('No data available.')).toBeInTheDocument();
    expect(screen.queryByTestId('stat-cards')).not.toBeInTheDocument();
  });

  it('starts in Current scope (singular title) when a course query param is present', () => {
    searchParamsValue.value = 'course=rs-2025';
    render(<CourseStatistic />);

    expect(screen.getByRole('heading', { name: 'Course Statistics' })).toBeInTheDocument();
    expect(screen.getByTestId('scope-selector')).toHaveAttribute('data-scope', 'Current');
    // Current scope renders the cards (not the Empty state).
    expect(screen.getByTestId('stat-cards')).toBeInTheDocument();
  });

  it('renders the stat cards on Timeline when a year is selected', () => {
    searchParamsValue.value = 'year=2025';
    useCoursesStats.mockReturnValue({ loading: false, coursesData: { studentsStats: {} } });
    render(<CourseStatistic />);

    const cards = screen.getByTestId('stat-cards');
    expect(cards).toBeInTheDocument();
    expect(cards).toHaveAttribute('data-has-data', 'true');
  });

  it('hides the scope selector for non-admin users', () => {
    mockSession.isAdmin = false;
    render(<CourseStatistic />);

    expect(screen.queryByTestId('scope-selector')).not.toBeInTheDocument();
  });

  it('switches scope to Current and pushes the updated query on toggle', () => {
    render(<CourseStatistic />);

    fireEvent.click(screen.getByRole('button', { name: 'to-current' }));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toContain('course=rs-2025');
    expect(screen.getByTestId('scope-selector')).toHaveAttribute('data-scope', 'Current');
  });

  it('switches scope to Timeline and writes the current year into the query', () => {
    searchParamsValue.value = 'course=rs-2025';
    render(<CourseStatistic />);

    fireEvent.click(screen.getByRole('button', { name: 'to-timeline' }));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0]?.[0]).toContain('year=');
    expect(screen.getByTestId('scope-selector')).toHaveAttribute('data-scope', 'Timeline');
  });

  it('pushes the chosen year on year selection', () => {
    searchParamsValue.value = 'year=2025';
    render(<CourseStatistic />);

    fireEvent.click(screen.getByRole('button', { name: 'pick-year' }));

    expect(push).toHaveBeenCalledWith(expect.stringContaining('year=2024'));
  });
});
