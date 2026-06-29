import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseTaskDto, MentorReviewDto } from '@client/api';
import MentorReviewsTable from '.';

// AssignReviewerModal is verified in its own spec and pulls in remote-search +
// course context; stub it to a marker that echoes the review it receives.
vi.mock('../AssignReviewerModal', () => ({
  default: ({
    review,
    onClose,
    onSubmit,
  }: {
    review: MentorReviewDto | null;
    onClose: () => void;
    onSubmit: () => void;
  }) =>
    review ? (
      <div role="dialog" aria-label="assign-reviewer">
        <span>assigning: {review.student}</span>
        <button onClick={onClose}>close-modal</button>
        <button onClick={onSubmit}>submit-modal</button>
      </div>
    ) : null,
}));

function buildReview(overrides: Partial<MentorReviewDto> = {}): MentorReviewDto {
  return {
    id: 1,
    taskName: 'Cross-check task',
    taskId: 10,
    solutionUrl: 'https://github.com/student/solution/pr/1',
    submittedAt: '2025-01-02T10:30:00.000Z',
    checker: 'checker-github',
    score: 0,
    maxScore: 100,
    student: 'student-github',
    studentId: 7,
    reviewedAt: '2025-01-03T12:00:00.000Z',
    taskDescriptionUrl: 'https://example.com/task',
    ...overrides,
  };
}

const TASKS_MOCK: CourseTaskDto[] = [{ id: 10, name: 'Cross-check task' } as CourseTaskDto];

function renderTable(props: Partial<React.ComponentProps<typeof MentorReviewsTable>> = {}) {
  const handleReviewerAssigned = vi.fn();
  const handleChange = vi.fn();
  render(
    <MentorReviewsTable
      content={[buildReview()]}
      pagination={false}
      handleChange={handleChange}
      handleReviewerAssigned={handleReviewerAssigned}
      tasks={TASKS_MOCK}
      isManager
      {...props}
    />,
  );
  return { handleReviewerAssigned, handleChange };
}

describe('MentorReviewsTable', () => {
  it.each`
    columnName
    ${'Task Name'}
    ${'Student'}
    ${'Submitted Date'}
    ${'Submitted Link'}
    ${'Checker'}
    ${'Reviewed Date'}
    ${'Score'}
    ${'Actions'}
  `('should render the "$columnName" column header for a manager', ({ columnName }: { columnName: string }) => {
    renderTable();

    expect(screen.getByText(columnName)).toBeInTheDocument();
  });

  it('should render the row data: task link, github links, dates and score', () => {
    renderTable();

    const table = screen.getByRole('table');
    expect(within(table).getByRole('link', { name: 'Cross-check task' })).toHaveAttribute(
      'href',
      'https://example.com/task',
    );
    // student & checker rendered via GithubUserLink
    expect(within(table).getAllByText('student-github').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('checker-github').length).toBeGreaterThan(0);
    expect(within(table).getByText('2025-01-02 10:30')).toBeInTheDocument();
    expect(within(table).getByText('2025-01-03 12:00')).toBeInTheDocument();
    expect(within(table).getByText(/0 \/ 100/)).toBeInTheDocument();
  });

  it('should render the score as "score / maxScore" when a score exists', () => {
    renderTable({ content: [buildReview({ score: 80 })] });

    expect(screen.getByText(/80 \/ 100/)).toBeInTheDocument();
  });

  it('should fall back to 0 in the score column when the review has no score', () => {
    renderTable({ content: [buildReview({ score: null as unknown as number })] });

    expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument();
  });

  it('should not render the checker link when there is no checker', () => {
    renderTable({ content: [buildReview({ checker: '' })] });

    const table = screen.getByRole('table');
    expect(within(table).queryByText('checker-github')).not.toBeInTheDocument();
  });

  it('should open the assign-reviewer modal with the clicked review', async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.queryByRole('dialog', { name: 'assign-reviewer' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Assign Reviewer' }));

    const dialog = screen.getByRole('dialog', { name: 'assign-reviewer' });
    expect(within(dialog).getByText('assigning: student-github')).toBeInTheDocument();
  });

  it('should close the modal again from inside it', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: 'Assign Reviewer' }));
    await user.click(screen.getByRole('button', { name: 'close-modal' }));

    expect(screen.queryByRole('dialog', { name: 'assign-reviewer' })).not.toBeInTheDocument();
  });

  it('should propagate the modal submit to handleReviewerAssigned', async () => {
    const user = userEvent.setup();
    const { handleReviewerAssigned } = renderTable();

    await user.click(screen.getByRole('button', { name: 'Assign Reviewer' }));
    await user.click(screen.getByRole('button', { name: 'submit-modal' }));

    expect(handleReviewerAssigned).toHaveBeenCalled();
  });

  it('should disable the "Assign Reviewer" action once the review has a score', () => {
    renderTable({ content: [buildReview({ score: 50 })] });

    expect(screen.getByRole('button', { name: 'Assign Reviewer' })).toBeDisabled();
  });

  it('should hide the Actions column for non-managers', () => {
    renderTable({ isManager: false });

    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Assign Reviewer' })).not.toBeInTheDocument();
  });
});
