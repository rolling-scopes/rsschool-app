import { render, screen } from '@testing-library/react';
import { CourseTaskDetailedDtoTypeEnum, CreateCourseTaskDtoCheckerEnum } from 'api';
import { CourseTaskVerifications } from '../../types';
import Coding, { CodingProps } from './Coding';

function renderCoding(type: CourseTaskDetailedDtoTypeEnum) {
  const courseTask = {
    name: 'Course Task',
    studentStartDate: '2022-09-10 12:00',
    studentEndDate: '2022-10-10 12:00',
    checker: CreateCourseTaskDtoCheckerEnum.AutoTest,
    id: 10,
    descriptionUrl: 'description-url',
    githubRepoName: 'github-repo-name',
    type,
    publicAttributes: {
      maxAttemptsNumber: 2,
    },
  } as CourseTaskVerifications;

  const props: CodingProps = {
    courseTask,
    githubId: 'github-id',
  };
  return render(<Coding {...props} />);
}

describe('Coding', () => {
  it.each`
    type                                        | text
    ${CourseTaskDetailedDtoTypeEnum.Codewars}   | ${/Please use the next username in your/i}
    ${CourseTaskDetailedDtoTypeEnum.Codewars}   | ${/codewars profile/i}
    ${CourseTaskDetailedDtoTypeEnum.Jstask}     | ${/Tests run on Node.js version 16. Please make sure your solution works on Node.js version 16./i}
    ${CourseTaskDetailedDtoTypeEnum.Jstask}     | ${/The system will run tests in the following repository and will update the score based on the result:/i}
    ${CourseTaskDetailedDtoTypeEnum.Jstask}     | ${/https:\/\/github.com\/github-id\/github-repo-name/i}
    ${CourseTaskDetailedDtoTypeEnum.Kotlintask} | ${/The system will run tests in the following repository and will update the score based on the result:/i}
    ${CourseTaskDetailedDtoTypeEnum.Kotlintask} | ${/https:\/\/github.com\/github-id\/github-repo-name/i}
  `(
    'should render $type task with $text',
    ({ type, text }: { type: CourseTaskDetailedDtoTypeEnum; text: RegExp | string }) => {
      renderCoding(type);

      expect(screen.getByText(text)).toBeInTheDocument();
    },
  );
});
