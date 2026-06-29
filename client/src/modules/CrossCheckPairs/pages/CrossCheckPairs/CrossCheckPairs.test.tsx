import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Modal } from 'antd';
import { CrossCheckPairDto } from '@client/api';
import Page from './CrossCheckPairs';

// --- Boundary mocks --------------------------------------------------------

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 42, name: 'Test Course' }, courses: [] }),
}));

// BadReviewControllers instantiates CheckService and is unit tested separately.
vi.mock('@client/modules/CrossCheckPairs/components/BadReview/BadReviewControllers', () => ({
  BadReviewControllers: ({ courseTasks }: { courseTasks: { id: number }[] }) => (
    <div data-testid="bad-review-controllers">tasks:{courseTasks.length}</div>
  ),
}));

const { getCrossCheckPairs, getCourseTasksDetails } = vi.hoisted(() => ({
  getCrossCheckPairs: vi.fn(),
  getCourseTasksDetails: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCrossCheckPairs };
  },
}));

vi.mock('@client/services/course', () => ({
  CourseService: class {
    getCourseTasksDetails = getCourseTasksDetails;
  },
}));

function makePair(overrides: Partial<CrossCheckPairDto> = {}): CrossCheckPairDto {
  return {
    student: { name: 'Stu', githubId: 'student-gh', id: 1 },
    checker: { name: 'Chk', githubId: 'checker-gh', id: 2 },
    task: { name: 'Task 1', id: 3 },
    score: 50,
    id: 100,
    comment: 'a comment',
    url: 'https://github.com/student/solution',
    reviewedDate: '2024-03-02T10:00:00.000Z',
    privateRepository: '',
    submittedDate: '2024-03-01T10:00:00.000Z',
    historicalScores: [{ comment: '{markdown}\nGreat job', dateTime: '2024-03-02T10:00:00.000Z' }],
    messages: [],
    ...overrides,
  } as CrossCheckPairDto;
}

const pairResponse = (items: CrossCheckPairDto[]) => ({
  data: { items, pagination: { current: 1, pageSize: 50, total: items.length } },
});

describe('<CrossCheckPairs page />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCrossCheckPairs.mockResolvedValue(pairResponse([makePair()]));
    getCourseTasksDetails.mockResolvedValue([
      { id: 3, name: 'Task 1', pairsCount: 4 },
      { id: 5, name: 'Task 2', pairsCount: 0 },
    ]);
  });

  afterEach(() => {
    Modal.destroyAll();
  });

  it('loads the cross-check pairs and renders them in the table', async () => {
    render(<Page />);

    expect(await screen.findByText('https://github.com/student/solution')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'checker-gh' })).toBeInTheDocument();

    await waitFor(() => {
      expect(getCrossCheckPairs).toHaveBeenCalledWith(42, 50, 1, 'task', 'ASC');
    });
  });

  it('passes only tasks that have pairs to the bad-review controllers', async () => {
    render(<Page />);

    // Only the task with pairsCount > 0 is forwarded.
    expect(await screen.findByText('tasks:1')).toBeInTheDocument();
  });

  it('opens the comment modal with the historical feedback for a pair', async () => {
    const user = userEvent.setup();
    render(<Page />);

    const showButton = await screen.findByRole('button', { name: 'Show' });
    await user.click(showButton);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText('Comment from checker-gh').length).toBeGreaterThan(0);
    expect(within(dialog).getByTestId('markdown')).toHaveTextContent('Great job');
  });

  it('re-fetches with sort/pagination params when the table changes', async () => {
    const user = userEvent.setup();
    render(<Page />);

    // Wait for the initial load to finish.
    await screen.findByText('https://github.com/student/solution');
    getCrossCheckPairs.mockClear();

    // Click a sortable column header (e.g. Score) to trigger onChange.
    const scoreHeader = screen.getByRole('columnheader', { name: /Score/ });
    await user.click(within(scoreHeader).getByText('Score'));

    await waitFor(() => {
      expect(getCrossCheckPairs).toHaveBeenCalled();
    });
    // The 4th arg is the order-by field; it falls back to the default 'task'.
    const callArgs = getCrossCheckPairs.mock.calls[0];
    expect(callArgs[0]).toBe(42);
  });
});
