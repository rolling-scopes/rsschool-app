import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseTaskDtoCheckerEnum, MentorReviewDto } from '@client/api';
import { MentorTasksReview } from './MentorTasksReview';

const { getCourseTasks, getMentorReviews, messageError, useRequestMock, isCourseManagerMock } = vi.hoisted(() => ({
  getCourseTasks: vi.fn(),
  getMentorReviews: vi.fn(),
  messageError: vi.fn(),
  useRequestMock: vi.fn(),
  isCourseManagerMock: vi.fn(),
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    MentorReviewsApi: class {
      getMentorReviews = getMentorReviews;
    },
    CoursesTasksApi: class {
      getCourseTasks = getCourseTasks;
    },
  };
});

vi.mock('ahooks', () => ({
  useRequest: (fn: (...args: unknown[]) => Promise<unknown>, options?: unknown) => useRequestMock(fn, options),
}));

// AssignReviewerModal (reached via the table) uses the default useRequest export;
// keep it out of the real ahooks runtime to avoid worker pressure.
vi.mock('ahooks/lib/useRequest', () => ({
  default: () => ({ runAsync: vi.fn().mockResolvedValue(undefined), loading: false }),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  SessionContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    displayName: 'Session',
  },
  useActiveCourseContext: () => ({
    course: { id: 1, name: 'RS 2025' },
    courses: [{ id: 1, name: 'RS 2025' }],
  }),
}));

vi.mock('@client/domain/user', () => ({
  isCourseManager: (...args: unknown[]) => isCourseManagerMock(...args),
}));

// Stub the remote-search Select inside the assign-reviewer modal.
vi.mock('@client/shared/components/MentorSearch', () => ({
  MentorSearch: () => <input aria-label="mentor-search" />,
}));

vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Replace antd message.error with a spy so the failure branch is observable.
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return { ...actual, message: { ...actual.message, error: messageError } };
});

const REVIEW_MOCK: MentorReviewDto = {
  id: 1,
  taskName: 'Review task',
  taskId: 10,
  solutionUrl: 'https://github.com/student/pr/1',
  submittedAt: '2025-01-02T10:30:00.000Z',
  checker: 'checker-github',
  score: 0,
  maxScore: 100,
  student: 'student-github',
  studentId: 7,
  reviewedAt: '',
  taskDescriptionUrl: 'https://example.com/task',
};

describe('MentorTasksReview page', () => {
  beforeEach(() => {
    getCourseTasks.mockReset().mockResolvedValue({ data: [{ id: 10, name: 'Review task' }] });
    getMentorReviews.mockReset().mockResolvedValue({
      data: { content: [REVIEW_MOCK], pagination: { current: 1, pageSize: 20, total: 1 } },
    });
    messageError.mockReset();
    // The page derives `tasksRequest.data` from one useRequest and drives the
    // reviews fetch through another via `runAsync`; expose both shapes.
    useRequestMock
      .mockReset()
      .mockImplementation((fn: (...args: unknown[]) => Promise<unknown>) => ({
        data: [{ id: 10, name: 'Review task' }],
        loading: false,
        run: fn,
        runAsync: fn,
      }));
    isCourseManagerMock.mockReset().mockReturnValue(true);
  });

  it('should render the title and the active course name', async () => {
    render(<MentorTasksReview />);

    expect(screen.getByRole('heading', { name: 'Mentor tasks review' })).toBeInTheDocument();
    expect(screen.getByText('Submitted tasks')).toBeInTheDocument();
    expect(await screen.findByText('RS 2025')).toBeInTheDocument();
  });

  it('should show the manager hint and fetch reviews for the active course on mount', async () => {
    render(<MentorTasksReview />);

    expect(screen.getByText(/You can assign a checker/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(getMentorReviews).toHaveBeenCalledWith(
        '1',
        '20',
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    );
  });

  it('should render the loaded review rows inside the table', async () => {
    render(<MentorTasksReview />);

    const table = await screen.findByRole('table');
    expect(within(table).getByRole('link', { name: 'Review task' })).toBeInTheDocument();
    expect(within(table).getAllByText('student-github').length).toBeGreaterThan(0);
  });

  it('should request mentor course tasks for the checker dropdown', () => {
    render(<MentorTasksReview />);

    const [requestFn] = useRequestMock.mock.calls[0] as [() => Promise<unknown>];
    return requestFn().then(() => {
      expect(getCourseTasks).toHaveBeenCalledWith(1, undefined, CourseTaskDtoCheckerEnum.Mentor);
    });
  });

  it('should hide the manager hint and the action column for non-managers', async () => {
    isCourseManagerMock.mockReturnValue(false);
    render(<MentorTasksReview />);

    await screen.findByRole('table');
    expect(screen.queryByText(/You can assign a checker/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('should surface an antd error message when loading reviews fails', async () => {
    getMentorReviews.mockRejectedValueOnce(new Error('boom'));
    render(<MentorTasksReview />);

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('Failed to load mentor reviews. Please try later.'));
  });

  it('should re-fetch reviews after a reviewer is assigned from the modal', async () => {
    const user = userEvent.setup();
    render(<MentorTasksReview />);

    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Assign Reviewer' }));

    // the assign-reviewer modal opens
    const dialog = await screen.findByRole('dialog');
    getMentorReviews.mockClear();
    await user.click(within(dialog).getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(getMentorReviews).toHaveBeenCalled());
  });

  it('should re-fetch reviews with sort params when the table sorting changes', async () => {
    const user = userEvent.setup();
    render(<MentorTasksReview />);

    await screen.findByRole('table');
    getMentorReviews.mockClear();

    // click the sortable "Submitted Date" column header to trigger onChange with a sorter
    const sortHeader = screen.getByRole('columnheader', { name: /Submitted Date/i });
    await user.click(sortHeader);

    // antd's first sort click = ascend; subsequent re-render effects re-fetch
    // without a sorter, so assert one of the calls carried the sort params.
    await waitFor(() =>
      expect(getMentorReviews.mock.calls.some(call => call.slice(-2).join(',') === 'submittedAt,ASC')).toBe(true),
    );
  });
});
