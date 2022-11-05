import { render, screen } from '@testing-library/react';
import { TaskSolutionsTable, TaskSolutionsTableProps } from '.';
import { MentorDashboardDto } from '../../../../api';
import { TaskSolutionsTableColumnName } from '../../constants';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

jest.mock('modules/Mentor/hooks/useMentorDashboard');

const PROPS_MOCK: TaskSolutionsTableProps = {
  mentorId: 1,
  courseId: 400,
};

describe('TaskSolutionsTable', () => {
  beforeEach(() => {
    const data = generateData();
    const useMentorDashboardMock = useMentorDashboard as jest.MockedFunction<typeof useMentorDashboard>;
    useMentorDashboardMock.mockReturnValueOnce([data, false]);
  });

  it.each`
    label
    ${TaskSolutionsTableColumnName.Name}
    ${TaskSolutionsTableColumnName.Task}
    ${TaskSolutionsTableColumnName.SolutionUrl}
    ${TaskSolutionsTableColumnName.Score}
    ${TaskSolutionsTableColumnName.SubmitScores}
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
  `('should render column data "$value"', ({ value }: { value: string }) => {
    render(<TaskSolutionsTable {...PROPS_MOCK} />);

    expect(screen.getByText(value)).toBeInTheDocument();
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
  }));
}
