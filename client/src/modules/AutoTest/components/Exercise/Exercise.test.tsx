import { render, screen } from '@testing-library/react';
import { CourseTaskDetailedDtoTypeEnum, CreateCourseTaskDtoCheckerEnum } from 'api';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import moment from 'moment';
import Exercise, { ExerciseProps } from './Exercise';

function renderExercise({
  type,
  studentEndDate = '2022-10-10 12:00',
}: {
  type: CourseTaskDetailedDtoTypeEnum;
  studentEndDate?: string;
}) {
  const courseTask = {
    name: 'Course Task',
    studentStartDate: '2022-09-10 12:00',
    studentEndDate,
    checker: CreateCourseTaskDtoCheckerEnum.AutoTest,
    id: 10,
    descriptionUrl: 'description-url',
    githubRepoName: 'github-repo-name',
    type,
    publicAttributes: {
      maxAttemptsNumber: 2,
    },
  } as CourseTaskVerifications;

  const props: ExerciseProps = {
    courseTask,
    courseId: 100,
    githubId: 'github-id',
    finishTask: jest.fn(),
  };

  return render(<Exercise {...props} />);
}

describe('Exercise', () => {
  it.each`
    type
    ${CourseTaskDetailedDtoTypeEnum.Codewars}
    ${CourseTaskDetailedDtoTypeEnum.Codejam}
    ${CourseTaskDetailedDtoTypeEnum.Cvhtml}
    ${CourseTaskDetailedDtoTypeEnum.Cvmarkdown}
    ${CourseTaskDetailedDtoTypeEnum.Htmltask}
    ${CourseTaskDetailedDtoTypeEnum.Ipynb}
    ${CourseTaskDetailedDtoTypeEnum.Jstask}
    ${CourseTaskDetailedDtoTypeEnum.Kotlintask}
    ${CourseTaskDetailedDtoTypeEnum.Objctask}
  `(
    'should not render "Show answers" button when task is $type',
    ({ type }: { type: CourseTaskDetailedDtoTypeEnum }) => {
      renderExercise({ type });

      const answersButton = screen.queryByRole('button', { name: /show answers/i });
      expect(answersButton).not.toBeInTheDocument();
    },
  );

  it('should render "Show answers" button when task is SelfEducation', () => {
    renderExercise({ type: CourseTaskDetailedDtoTypeEnum.Selfeducation });

    const answersButton = screen.getByRole('button', { name: /show answers/i });
    expect(answersButton).toBeInTheDocument();
  });

  it('should disable "Show answers" button when the deadline is passed', () => {
    const endDate = moment().subtract(7, 'd').format();
    renderExercise({ type: CourseTaskDetailedDtoTypeEnum.Selfeducation, studentEndDate: endDate });

    const answersButton = screen.getByRole('button', { name: /show answers/i });
    expect(answersButton).toBeDisabled();
  });
  
  it('should not disable "Show answers" button when the deadline is not passed', () => {
    const endDate = moment().add(7, 'd').format();
    renderExercise({ type: CourseTaskDetailedDtoTypeEnum.Selfeducation, studentEndDate: endDate });

    const answersButton = screen.getByRole('button', { name: /show answers/i });
    expect(answersButton).toBeEnabled();
  });
});
