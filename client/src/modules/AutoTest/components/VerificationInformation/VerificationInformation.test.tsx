import { render, screen } from '@testing-library/react';
import { CourseTaskDetailedDtoTypeEnum, CreateCourseTaskDtoCheckerEnum } from 'api';
import { CourseTaskVerifications } from 'modules/AutoTest/types';
import VerificationInformation, { VerificationInformationProps } from './VerificationInformation';

function renderVerificationInformation({
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

  const props: VerificationInformationProps = {
    courseTask,
    isTableVisible: true,
    loading: false,
    reload: jest.fn(),
    startTask: jest.fn(),
    showAnswers: jest.fn(),
  };

  return render(<VerificationInformation {...props} />);
}

describe('VerificationInformation', () => {
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
      renderVerificationInformation({ type });

      const answersButton = screen.queryByRole('button', { name: /show answers/i });
      expect(answersButton).not.toBeInTheDocument();
    },
  );

  it('should render "Show answers" button when task is SelfEducation', () => {
    renderVerificationInformation({ type: CourseTaskDetailedDtoTypeEnum.Selfeducation });

    const answersButton = screen.getByRole('button', { name: /show answers/i });
    expect(answersButton).toBeInTheDocument();
  });
});
