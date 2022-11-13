import { render, screen } from '@testing-library/react';
import { TaskSolutionsTable, TaskSolutionsTableProps } from '.';
import { MentorDashboardDto } from '../../../../api';
import { StudentTaskSolutionItemStatus, TaskSolutionsTableColumnName } from '../../constants';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

jest.mock('modules/Mentor/hooks/useMentorDashboard');

const PROPS_MOCK: TaskSolutionsTableProps = {
  mentorId: 1,
  courseId: 400,
};

describe('TaskSolutionsTable', () => {
  const useMentorDashboardMock = useMentorDashboard as jest.MockedFunction<typeof useMentorDashboard>;
  describe('when full data was provided', () => {
    const data = generateData();

    beforeEach(() => {
      useMentorDashboardMock.mockReturnValueOnce([data, false]);
    });

    afterEach(() => {
      useMentorDashboardMock.mockClear();
    });

    it.each`
      label
      ${TaskSolutionsTableColumnName.Name}
      ${TaskSolutionsTableColumnName.Task}
      ${TaskSolutionsTableColumnName.SolutionUrl}
      ${TaskSolutionsTableColumnName.Score}
      ${TaskSolutionsTableColumnName.SubmitScores}
      ${TaskSolutionsTableColumnName.DesiredDeadline}
    `('should render column name "$label"', ({ label }: { label: string }) => {
      render(<TaskSolutionsTable {...PROPS_MOCK} />);

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
      render(<TaskSolutionsTable {...PROPS_MOCK} />);

      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  describe('when result score was not provided', () => {
    beforeEach(() => {
      const data = [{ ...generateData()[0], resultScore: null, endDate: new Date('1970-05-05').toISOString() }];
      useMentorDashboardMock.mockReturnValueOnce([data, false]);
    });

    afterEach(() => {
      useMentorDashboardMock.mockClear();
    });

    describe('and when deadline passed', () => {
      it('should render date as warning', () => {
        render(<TaskSolutionsTable {...PROPS_MOCK} />);

        const date = screen.getByText('1970-05-05 00:00');
        expect(date).toHaveClass('ant-typography-warning');
      });
    });

    it('should render "-" instead of result score', () => {
      render(<TaskSolutionsTable {...PROPS_MOCK} />);

      const score = screen.getByText('- / 100');
      expect(score).toBeInTheDocument();
    });
  });
});

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
    status: StudentTaskSolutionItemStatus.InReview,
    endDate: new Date(`1970-02-0${idx + 1}`).toISOString(),
  }));
}
