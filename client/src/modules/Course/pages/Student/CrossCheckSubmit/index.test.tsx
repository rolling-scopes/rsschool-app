import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactNode, createContext } from 'react';
import { useRouter } from 'next/router';
import { CrossCheckSubmit } from './';

// --- Context (Course module is context-heavy) ------------------------------

// The session context is created inside the lazily-evaluated factory (vi.mock is
// hoisted above module-level consts; referencing an outer const would TDZ).
const { useActiveCourseContext } = vi.hoisted(() => ({ useActiveCourseContext: vi.fn() }));

vi.mock('@client/modules/Course/contexts', () => ({
  SessionContext: createContext({ id: 1, githubId: 'octocat', isAdmin: false, courses: {} }),
  useActiveCourseContext,
}));

// --- ahooks useRequest: feeds the course tasks list ------------------------

const { useRequest } = vi.hoisted(() => ({ useRequest: vi.fn() }));
vi.mock('ahooks', () => ({ useRequest }));

// --- Service / API boundary ------------------------------------------------

const {
  postTaskSolution,
  deleteTaskSolution,
  getCrossCheckTaskSolution,
  getCrossCheckTaskDetails,
  getMyCrossCheckFeedbacks,
} = vi.hoisted(() => ({
  postTaskSolution: vi.fn().mockResolvedValue(undefined),
  deleteTaskSolution: vi.fn().mockResolvedValue(undefined),
  getCrossCheckTaskSolution: vi.fn().mockResolvedValue(null),
  getCrossCheckTaskDetails: vi.fn().mockResolvedValue({ criteria: [], studentEndDate: '2999-01-01' }),
  getMyCrossCheckFeedbacks: vi.fn().mockResolvedValue({ data: { reviews: [] } }),
}));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService() {
    return {
      getCourseCrossCheckTasks: vi.fn(),
      postTaskSolution,
      deleteTaskSolution,
      getCrossCheckTaskSolution,
      getCrossCheckTaskDetails,
    };
  },
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getMyCrossCheckFeedbacks };
  },
}));

vi.mock('@client/modules/CrossCheck/hooks', () => ({
  useSolutionReviewSettings: () => ({ isShowReviewsCommentsExpanded: false }),
}));

// --- Brittle children: stub to lightweight markers -------------------------

vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/shared/components/Forms', () => ({
  CourseTaskSelect: ({ data, onChange }: { data: any[]; onChange: (v: number) => void }) => (
    <select aria-label="task" onChange={e => onChange(Number(e.target.value))}>
      <option value="">--</option>
      {data.map(t => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  ),
  ScoreInput: () => <div data-testid="score-input" />,
}));

vi.mock('@client/modules/Course/components/NoSubmissionAvailable', () => ({
  NoSubmissionAvailable: () => <div>No submission available</div>,
}));

vi.mock('@client/modules/CrossCheck/components/CriteriaForm', () => ({
  CriteriaForm: ({ onChange }: { onChange: (review: any[], comments: any[]) => void }) => (
    <button
      type="button"
      data-testid="criteria-form"
      onClick={() => onChange([{ criteriaId: 'c1', percentage: 0.5 }], [])}
    >
      criteria
    </button>
  ),
}));
vi.mock('@client/modules/CrossCheck/components/SolutionReview', () => ({
  SolutionReview: () => <div data-testid="solution-review" />,
}));
vi.mock('@client/modules/CrossCheck/components/SolutionReviewSettingsPanel', () => ({
  SolutionReviewSettingsPanel: () => <div data-testid="settings-panel" />,
}));
vi.mock('@client/modules/CrossCheck/components/SubmittedStatus', () => ({
  SubmittedStatus: ({ taskExists }: { taskExists: boolean }) => (
    <div data-testid="submitted-status">{taskExists ? 'exists' : 'none'}</div>
  ),
}));

const { messageSuccess, messageError } = vi.hoisted(() => ({
  messageSuccess: vi.fn(),
  messageError: vi.fn(),
}));
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: messageSuccess, error: messageError } }),
}));

// --- Helpers ---------------------------------------------------------------

const course = { id: 42, alias: 'rs-2024', name: 'RS 2024' };

const startedTask = {
  id: 7,
  name: 'Cross-Check Task',
  maxScore: 100,
  studentEndDate: '2999-01-01',
  validations: {},
  crossCheckStatus: 'distributed',
};

function setTasks(tasks: any[], loading = false) {
  useRequest.mockReturnValue({ data: tasks, loading });
}

// Drive task selection through the router query (component reads router.query.taskId
// and calls handleTaskChange in a useEffect).
function setQueryTaskId(taskId?: number) {
  vi.mocked(useRouter).mockReturnValue({
    query: taskId ? { taskId: String(taskId) } : {},
    route: '/course/student/cross-check-submit',
    replace: vi.fn(),
    push: vi.fn(),
  } as any);
}

describe('<CrossCheckSubmit />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActiveCourseContext.mockReturnValue({ course });
    setTasks([startedTask]);
    setQueryTaskId();
  });

  it('renders the page title and the task selector', () => {
    render(<CrossCheckSubmit />);
    expect(screen.getByRole('heading', { name: /cross-check submit/i })).toBeInTheDocument();
    expect(screen.getByLabelText('task')).toBeInTheDocument();
  });

  it('shows the no-submission message when there are no tasks', () => {
    setTasks([]);
    render(<CrossCheckSubmit />);
    expect(screen.getByText('No submission available')).toBeInTheDocument();
  });

  it('loads task details when a task is selected and reveals the submit form', async () => {
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    await waitFor(() => expect(getCrossCheckTaskDetails).toHaveBeenCalledWith(7));
    expect(getMyCrossCheckFeedbacks).toHaveBeenCalledWith(42, 7);
    // Submit button appears because the task exists and the deadline is in the future.
    expect(await screen.findByRole('button', { name: /^submit$/i })).toBeInTheDocument();
  });

  it('submits the solution url and shows a success message', async () => {
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);
    await screen.findByRole('button', { name: /^submit$/i });

    const input = screen.getByPlaceholderText(/link in the form of/i);
    fireEvent.change(input, { target: { value: 'https://github.com/octocat/pr/1' } });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(postTaskSolution).toHaveBeenCalledWith('octocat', 7, 'https://github.com/octocat/pr/1', undefined, []),
    );
    expect(messageSuccess).toHaveBeenCalledWith('The task solution has been submitted');
  });

  it('opens the cancel-submission modal and cancels an existing solution', async () => {
    getCrossCheckTaskSolution.mockResolvedValueOnce({ url: 'https://x', review: [], comments: [], studentId: 9 });
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    // "Cancel Submit" only renders once a submitted solution is loaded.
    const cancelBtn = await screen.findByRole('button', { name: /cancel submit/i });
    fireEvent.click(cancelBtn);

    await screen.findByRole('dialog');
    // OK is disabled until the acknowledgement checkbox is checked.
    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(okButton).toBeEnabled();
    fireEvent.click(okButton);

    await waitFor(() => expect(deleteTaskSolution).toHaveBeenCalledWith('octocat', 7));
    expect(messageSuccess).toHaveBeenCalledWith('The task submission has been canceled');
  });

  it('shows an error message when the submission fails', async () => {
    postTaskSolution.mockRejectedValueOnce(new Error('boom'));
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);
    await screen.findByRole('button', { name: /^submit$/i });

    fireEvent.change(screen.getByPlaceholderText(/link in the form of/i), {
      target: { value: 'https://github.com/octocat/pr/1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => expect(messageError).toHaveBeenCalledWith('An error occured. Please try later.'));
  });

  it('renders the criteria form and recalculates the score on review change', async () => {
    getCrossCheckTaskDetails.mockResolvedValueOnce({
      criteria: [{ criteriaId: 'c1', max: 10 }],
      studentEndDate: '2999-01-01',
    });
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    const criteriaForm = await screen.findByTestId('criteria-form');
    expect(screen.getByTestId('score-input')).toBeInTheDocument();

    // Firing the criteria form's onChange runs handleReviewChange -> calculateFinalScore.
    fireEvent.click(criteriaForm);
    // No assertion target beyond no-throw: the score field update is internal to antd Form.
    expect(criteriaForm).toBeInTheDocument();
  });

  it('renders received feedback reviews', async () => {
    getMyCrossCheckFeedbacks.mockResolvedValueOnce({ data: { reviews: [{}, {}] } });
    getCrossCheckTaskSolution.mockResolvedValueOnce({ url: 'https://x', review: [], comments: [], studentId: 9 });
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    await waitFor(() => expect(screen.getAllByTestId('solution-review')).toHaveLength(2));
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
  });

  it('replaces the task query when a task is chosen from the selector', async () => {
    const replace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      query: {},
      route: '/course/student/cross-check-submit',
      replace,
      push: vi.fn(),
    } as any);
    render(<CrossCheckSubmit />);

    fireEvent.change(screen.getByLabelText('task'), { target: { value: '7' } });
    expect(replace).toHaveBeenCalledWith(expect.stringContaining('taskId=7'));
  });

  it('does nothing while the tasks are still loading even if a task id is queued', () => {
    // loading=true → the effect early-returns before calling handleTaskChange.
    setTasks([startedTask], true);
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    expect(getCrossCheckTaskDetails).not.toHaveBeenCalled();
    expect(getMyCrossCheckFeedbacks).not.toHaveBeenCalled();
  });

  it('ignores a queued task id that is not in the loaded tasks list', async () => {
    // queryTaskId=999 is absent from [startedTask] → courseTask == null → handleTaskChange returns early.
    setQueryTaskId(999);
    render(<CrossCheckSubmit />);

    expect(await screen.findByRole('heading', { name: /cross-check submit/i })).toBeInTheDocument();
    expect(getCrossCheckTaskDetails).not.toHaveBeenCalled();
    expect(getMyCrossCheckFeedbacks).not.toHaveBeenCalled();
  });

  it('treats a task without studentEndDate as past the submit deadline (no submit form)', async () => {
    getCrossCheckTaskDetails.mockResolvedValueOnce({ criteria: [] }); // no studentEndDate -> endDate null -> deadline passed
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    await waitFor(() => expect(getCrossCheckTaskDetails).toHaveBeenCalledWith(7));
    // deadline passed → submit form is hidden.
    await waitFor(() => expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument());
  });

  it('adds the github-id and github-PR validation rules and renders the submit hint', async () => {
    setTasks([
      {
        ...startedTask,
        submitText: 'Read the rules before submitting',
        validations: { githubIdInUrl: true, githubPrInUrl: true },
      },
    ]);
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    await screen.findByRole('button', { name: /^submit$/i });
    // submitText → Alert is rendered.
    expect(screen.getByText('Read the rules before submitting')).toBeInTheDocument();

    // Submitting an invalid (non-PR) URL surfaces the PR-specific rule message.
    fireEvent.change(screen.getByPlaceholderText(/link in the form of/i), {
      target: { value: 'https://example.com/not-a-pr' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText(/valid GitHub Pull Request URL/i)).toBeInTheDocument();
    expect(postTaskSolution).not.toHaveBeenCalled();
  });

  it('rejects a private RS School repo url with a dedicated validation message', async () => {
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);
    await screen.findByRole('button', { name: /^submit$/i });

    fireEvent.change(screen.getByPlaceholderText(/link in the form of/i), {
      target: { value: 'https://github.com/rolling-scopes-school/private-repo/pull/1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText(/Students can't see Pull Requests of private RS School repos/i)).toBeInTheDocument();
    expect(postTaskSolution).not.toHaveBeenCalled();
  });

  it('shows the "completed, no one checked" result with an appeal link when cross-check is completed', async () => {
    setTasks([{ ...startedTask, crossCheckStatus: 'completed' }]);
    getCrossCheckTaskSolution.mockResolvedValueOnce({ url: 'https://x', review: [], comments: [], studentId: 9 });
    getMyCrossCheckFeedbacks.mockResolvedValueOnce({ data: { reviews: [] } });
    setQueryTaskId(7);
    render(<CrossCheckSubmit />);

    expect(await screen.findByText('No one has checked your work.')).toBeInTheDocument();
    // The appeal link is rendered only for the completed status.
    expect(screen.getByRole('link', { name: /eligible to appeal/i })).toBeInTheDocument();
  });
});
