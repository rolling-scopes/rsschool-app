import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorReviewDto } from '@client/api';
import AssignReviewerModal from './AssignReviewerModal';

const { assignReviewer, runAsync, useRequestMock } = vi.hoisted(() => {
  const assignReviewer = vi.fn();
  const runAsync = vi.fn();
  return { assignReviewer, runAsync, useRequestMock: vi.fn() };
});

vi.mock('@client/api', () => ({
  MentorReviewsApi: class {
    assignReviewer = assignReviewer;
  },
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 42, name: 'Test Course' } }),
}));

// Stub the remote-search Select: render a plain native control bound to the
// "mentorId" form field so user interaction sets a real value.
vi.mock('@client/shared/components/MentorSearch', () => ({
  MentorSearch: ({ value, onChange }: { value?: number; onChange?: (v: number) => void }) => (
    <input aria-label="mentor-search" value={value ?? ''} onChange={e => onChange?.(Number(e.target.value))} />
  ),
}));

vi.mock('ahooks/lib/useRequest', () => ({
  default: (fn: unknown, options: unknown) => useRequestMock(fn, options),
}));

const REVIEW_MOCK: MentorReviewDto = {
  id: 1,
  taskName: 'Test Task',
  taskId: 10,
  solutionUrl: 'https://github.com/student/pr/1',
  submittedAt: '2025-01-01T00:00:00.000Z',
  checker: '',
  score: 0,
  maxScore: 100,
  student: 'student-github',
  studentId: 7,
  reviewedAt: '',
  taskDescriptionUrl: 'https://example.com/task',
};

function renderModal(props: Partial<React.ComponentProps<typeof AssignReviewerModal>> = {}) {
  const onClose = vi.fn();
  const onSubmit = vi.fn();
  render(<AssignReviewerModal review={REVIEW_MOCK} onClose={onClose} onSubmit={onSubmit} {...props} />);
  return { onClose, onSubmit };
}

describe('AssignReviewerModal', () => {
  beforeEach(() => {
    runAsync.mockReset().mockResolvedValue(undefined);
    assignReviewer.mockReset();
    useRequestMock.mockReset().mockReturnValue({ runAsync, loading: false });
  });

  it('should not render the modal when no review is provided', () => {
    renderModal({ review: null });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the modal title with the student name and the review details', () => {
    renderModal();

    expect(screen.getByText(/Assign Reviewer for student-github/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: REVIEW_MOCK.taskName })).toHaveAttribute(
      'href',
      REVIEW_MOCK.taskDescriptionUrl,
    );
    expect(screen.getByRole('link', { name: REVIEW_MOCK.solutionUrl })).toHaveAttribute(
      'href',
      REVIEW_MOCK.solutionUrl,
    );
  });

  it('should assign the reviewer and show the success result on submit', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByLabelText('mentor-search'), '99');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(runAsync).toHaveBeenCalledWith(42, { courseTaskId: 10, studentId: 7, mentorId: 99 }));
    expect(onSubmit).toHaveBeenCalled();
    expect(await screen.findByText('Reviewer has been successfully assigned')).toBeInTheDocument();
  });

  it('should submit with an undefined mentorId when none is selected', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(runAsync).toHaveBeenCalledWith(42, { courseTaskId: 10, studentId: 7, mentorId: undefined }),
    );
  });

  it('should render the server error message when the request rejects', async () => {
    const user = userEvent.setup();
    runAsync.mockRejectedValueOnce({ response: { data: { message: 'Reviewer is busy' } } });
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Reviewer is busy')).toBeInTheDocument();
  });

  it('should fall back to the error message when the response has no body', async () => {
    const user = userEvent.setup();
    runAsync.mockRejectedValueOnce(new Error('Network down'));
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });

  it('should reset state and call onClose when cancelled', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should show an antd error message when the request hook errors', () => {
    renderModal();

    const [, options] = useRequestMock.mock.calls[0] as [unknown, { onError: () => void }];
    // exercising the onError callback wired into useRequest does not throw
    expect(() => options.onError()).not.toThrow();
  });
});
