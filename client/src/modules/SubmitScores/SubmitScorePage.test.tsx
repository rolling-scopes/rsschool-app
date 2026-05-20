import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactNode } from 'react';
import { SubmitScorePage } from '@client/pages/course/submit-scores';

// --- Mocks -----------------------------------------------------------------

vi.mock('next/config', () => ({ default: () => ({}) }));

vi.mock('@client/modules/Course/contexts', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  SessionContext: { Provider: ({ children }: { children: ReactNode }) => <>{children}</>, _currentValue: {} },
  useActiveCourseContext: () => ({ course: { id: 42, name: 'Test Course' } }),
}));

// Provide a stub `useContext(SessionContext)` value.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useContext: (ctx: unknown) => {
      // Return a permissive session — course manager for course 42.
      if (ctx && typeof ctx === 'object') {
        return { id: 1, isAdmin: true, courses: { 42: { roles: ['manager'] } } };
      }
      return actual.useContext(ctx as React.Context<unknown>);
    },
  };
});

vi.mock('@client/domain/user', () => ({
  isCourseManager: () => true,
}));

const { getCourseTasks } = vi.hoisted(() => ({
  getCourseTasks: vi.fn().mockResolvedValue({
    data: [
      { id: 1, name: 'Task A', studentStartDate: '2024-01-01', studentEndDate: '2024-12-31', taskOwner: null },
      { id: 2, name: 'Task B', studentStartDate: '2024-01-01', studentEndDate: '2024-12-31', taskOwner: null },
    ],
  }),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
}));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService() {
    return {
      postMultipleScores: vi.fn().mockResolvedValue([]),
      searchStudents: vi.fn().mockResolvedValue([]),
    };
  },
}));

vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: (props: { value?: string; onChange?: (v: string) => void }) => (
    <input
      data-testid="student-input"
      value={props.value ?? ''}
      onChange={e => props.onChange?.(e.target.value)}
    />
  ),
}));

// PageLayoutSimple may pull in heavy deps; replace with a passthrough.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayoutSimple: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// --- Tests -----------------------------------------------------------------

describe('<SubmitScorePage />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page with both "Upload CSV" and "Manual Entry" tabs', async () => {
    render(<SubmitScorePage />);

    expect(screen.getByRole('heading', { name: /submit scores/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /upload csv/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /manual entry/i })).toBeInTheDocument();
  });

  it('shows the CSV tab by default with the file uploader and uploading rules', async () => {
    render(<SubmitScorePage />);

    // Default tab — CSV.
    expect(screen.getByText(/uploading rules/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument();
  });

  it('switches to the Manual Entry tab and shows manual form controls', async () => {
    render(<SubmitScorePage />);

    fireEvent.click(screen.getByRole('tab', { name: /manual entry/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
    });
    // One initial row → one student input.
    expect(screen.getAllByTestId('student-input')).toHaveLength(1);
  });

  it('fetches course tasks on mount', async () => {
    render(<SubmitScorePage />);

    await waitFor(() => {
      expect(getCourseTasks).toHaveBeenCalledWith(42);
    });
  });
});
