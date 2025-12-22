import { fireEvent, render, screen } from '@testing-library/react';
import { TaskSolutionsTable, TaskSolutionsTableProps } from '.';
import { MentorDashboardDto } from '@client/api';
import { SolutionItemStatus, TaskSolutionsTableColumnName } from '../../constants';

jest.mock('modules/Mentor/hooks/useMentorDashboard');

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
  onChange: jest.fn(),
};

describe('TaskSolutionsTable', () => {
  describe('when full data was provided', () => {
    it.each`
      label
      ${TaskSolutionsTableColumnName.Student}
      ${TaskSolutionsTableColumnName.Task}
      ${TaskSolutionsTableColumnName.SolutionUrl}
      ${TaskSolutionsTableColumnName.Score}
      ${TaskSolutionsTableColumnName.SubmitScores}
      ${TaskSolutionsTableColumnName.DesiredDeadline}
    `('should render column name "$label"', ({ label }: { label: string }) => {
      render(<TaskSolutionsTable {...mockProps} />);

      const name = screen.getByText(label);

      expect(name).toBeInTheDocument();
    });

    it.each`
      value
      ${'Student 0'}
      ${'Task 0'}
      ${'solution-url-0'}
      ${'20 / 100'}
      ${'1970-02-01 00:00'}
    `('should render column data "$value"', ({ value }: { value: string }) => {
      render(<TaskSolutionsTable {...mockProps} />);

      expect(screen.getByText(value)).toBeInTheDocument();
    });

    it('should render "Review random task" button when "Random task" tab is selected', async () => {
      render(<TaskSolutionsTable {...mockProps} />);
      const randomTaskTab = screen.getByRole('tab', { name: /random task/i });

      fireEvent.click(randomTaskTab);

      const reviewBtn = await screen.findByText(/review random task/i);
      expect(reviewBtn).toBeInTheDocument();
    });

    it('should not render "Review random task" button when "Random task" tab is not selected', () => {
      render(<TaskSolutionsTable {...mockProps} />);

      const reviewBtn = screen.queryByText(/review random task/i);
      expect(reviewBtn).not.toBeInTheDocument();
    });
  });

  describe('when result score was not provided', () => {
    describe('and when deadline passed', () => {
      it('should render date as warning', () => {
        const data = [
          {
            ...(generateData()[0] as MentorDashboardDto),
            resultScore: null,
            endDate: new Date('1970-05-05T00:00:00').toISOString(),
          },
        ];
        render(<TaskSolutionsTable {...mockProps} data={data} />);

        const date = screen.getByText('1970-05-05 00:00');
        expect(date).toHaveClass('ant-typography-warning');
      });
    });

    it('should render "-" instead of result score', () => {
      const data = [
        {
          ...(generateData()[0] as MentorDashboardDto),
          resultScore: null,
          endDate: new Date('1970-05-05T00:00:00').toISOString(),
        },
      ];
      render(<TaskSolutionsTable {...mockProps} data={data} />);

      const score = screen.getByText('- / 100');
      expect(score).toBeInTheDocument();
    });
  });
});
