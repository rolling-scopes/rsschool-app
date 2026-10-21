import { render, screen } from '@testing-library/react';
import { CourseTaskDetailedDtoTypeEnum, CheckerEnum } from '@client/api';
import { CourseTaskVerifications } from '@client/modules/AutoTest/types';
import Coding, { CodingProps } from './Coding';

function renderCoding(type: CourseTaskDetailedDtoTypeEnum) {
  const courseTask = {
    name: 'Course Task',
    studentStartDate: '2022-09-10 12:00',
    studentEndDate: '2022-10-10 12:00',
    checker: CheckerEnum.AutoTest,
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
  it.each([
    {
      type: CourseTaskDetailedDtoTypeEnum.Codewars,
      texts: [/Please use the next username in your/i, /codewars profile/i],
    },
    {
      type: CourseTaskDetailedDtoTypeEnum.Jstask,
      texts: [
        /Tests run on Node.js version 22. Please make sure your solution works on Node.js version 22./i,
        /The system will run tests in the following repository and will update the score based on the result:/i,
        /https:\/\/github.com\/github-id\/github-repo-name/i,
      ],
    },
    {
      type: CourseTaskDetailedDtoTypeEnum.Kotlintask,
      texts: [
        /The system will run tests in the following repository and will update the score based on the result:/i,
        /https:\/\/github.com\/github-id\/github-repo-name/i,
      ],
    },
  ])('should render $type task instructions', async ({ type, texts }) => {
    renderCoding(type);

    for (const text of texts) {
      expect(await screen.findByText(text)).toBeInTheDocument();
    }
  });
});
