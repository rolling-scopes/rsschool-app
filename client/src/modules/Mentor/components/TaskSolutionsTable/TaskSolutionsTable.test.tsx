import { fireEvent, render, screen, within } from '@testing-library/react';
import { TaskSolutionsTable, TaskSolutionsTableProps } from '.';
import { MentorDashboardDto } from '@client/api';
import { SolutionItemStatus, TaskSolutionsTableColumnName } from '../../constants';

vi.mock('@client/modules/Mentor/hooks/useMentorDashboard');

function generateData(count = 3): MentorDashboardDto[] {
  return new Array(count).fill({}).map((_, idx) => ({
    courseTaskId: idx + 1,
    maxScore: idx + 100,
    resultScore: idx + 20,
    solutionUrl: `solution-url-${idx}`,
    studentGithubId: `student-github-${idx}`,
    studentName: `Student ${idx}`,
    taskDescriptionUrl: `task-url-${idx}`,
    taskName: `Task ${idx}`,
    status: SolutionItemStatus.InReview,
    endDate: new Date(`1970-02-0${idx + 1}T00:00:00`).toISOString(),
  }));
}

const mockProps: TaskSolutionsTableProps = {
  mentorId: 1,
  courseId: 400,
  data: generateData(),
  loading: false,
  onChange: vi.fn(),
};

describe('TaskSolutionsTable', () => {
  describe('when full data was provided', () => {
    it('should render column names and data', () => {
      render(<TaskSolutionsTable {...mockProps} />);

      for (const label of [
        TaskSolutionsTableColumnName.Student,
        TaskSolutionsTableColumnName.Task,
        TaskSolutionsTableColumnName.SolutionUrl,
        TaskSolutionsTableColumnName.Score,
        TaskSolutionsTableColumnName.SubmitScores,
        TaskSolutionsTableColumnName.DesiredDeadline,
      ]) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
      for (const value of ['Student 0', 'Task 0', 'solution-url-0', '20 / 100', '1970-02-01 00:00']) {
        expect(screen.getByText(value)).toBeInTheDocument();
      }
    });

    it('should show "Review random task" only after selecting the "Random task" tab', async () => {
      render(<TaskSolutionsTable {...mockProps} />);
      expect(screen.queryByText(/review random task/i)).not.toBeInTheDocument();
      const randomTaskTab = screen.getByRole('tab', { name: /random task/i });

      fireEvent.click(randomTaskTab);

      const reviewBtn = await screen.findByText(/review random task/i);
      expect(reviewBtn).toBeInTheDocument();
    });

    it('should open the submit review modal when a row Submit button is clicked', () => {
      // Clicking the per-row Submit button runs handleSubmitButtonClick -> setModalData,
      // which opens the SubmitReviewModal titled with the student name.
      render(<TaskSolutionsTable {...mockProps} />);

      // Scope the action to its student without traversing every row's buttons.
      // eslint-disable-next-line testing-library/no-node-access
      const row = screen.getByText('Student 0').closest('tr');
      expect(row).toHaveRole('row');
      fireEvent.click(within(row!).getByRole('button', { name: 'Submit' }));

      expect(screen.getByText(/Submit Score for Student 0/)).toBeInTheDocument();
    });
  });

  describe('on a mobile (xs) viewport', () => {
    const originalWidth = window.innerWidth;

    afterEach(() => {
      window.innerWidth = originalWidth;
      window.dispatchEvent(new Event('resize'));
    });

    it('renders the compact mobile column and falls back to plain text for missing fields', () => {
      // Shrink to an xs viewport so the mobile (responsive ['xs']) column renders,
      // exercising renderMobile and the "no link / no score" fallback branches of
      // renderName/renderTask/renderSolutionUrl/renderScore.
      window.innerWidth = 400;
      window.dispatchEvent(new Event('resize'));

      const data = [
        {
          ...(generateData()[0] as MentorDashboardDto),
          studentName: '',
          taskDescriptionUrl: '',
          solutionUrl: '',
          taskName: 'Plain Task',
          maxScore: 0,
        },
      ];

      render(<TaskSolutionsTable {...mockProps} data={data} />);

      expect(screen.getByText('Plain Task')).toBeInTheDocument();
    });
  });

  describe('when result score was not provided', () => {
    it('should render a missing score and warn when the deadline passed', () => {
      const data = [
        {
          ...(generateData()[0] as MentorDashboardDto),
          resultScore: null,
          endDate: new Date('1970-05-05T00:00:00').toISOString(),
        },
      ];
      render(<TaskSolutionsTable {...mockProps} data={data} />);

      expect(screen.getByText('1970-05-05 00:00')).toHaveClass('ant-typography-warning');
      expect(screen.getByText('- / 100')).toBeInTheDocument();
    });
  });
});
