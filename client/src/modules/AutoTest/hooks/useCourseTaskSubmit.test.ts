import { renderHook } from '@testing-library/react-hooks';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { useCourseTaskSubmit } from './useCourseTaskSubmit';
import { FilesService } from 'services/files';

jest.mock('services/files');

const uploadFileMock = jest.fn().mockImplementation(() => ({ s3Key: 'some-string' }));
(FilesService as jest.Mock).mockImplementation(() => ({ uploadFile: uploadFileMock }));

const FILE_VALUE_MOCK = {
  upload: {
    file: {
      originFileObj: new File([new Blob(['blob-blob'])], 'file-name'),
    },
  },
};

const CODING_TASK_RESULT = {
  githubRepoName: 'github-repo-name',
  sourceGithubRepoUrl: 'source-github-repo-url',
};

describe('useCourseTaskSubmit', () => {
  describe('collectData', () => {
    it.each`
      type                                           | values                                  | result
      ${CourseTaskDetailedDtoTypeEnum.Ipynb}         | ${FILE_VALUE_MOCK}                      | ${{ s3Key: expect.any(String), taskName: 'course_task_ipynb' }}
      ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${{ ['answer-0']: 1, ['answer-1']: 2 }} | ${[{ index: 0, value: 1 }, { index: 1, value: 2 }]}
      ${CourseTaskDetailedDtoTypeEnum.Codewars}      | ${{}}                                   | ${{ deadline: '2022-10-10T00:00.000Z' }}
      ${CourseTaskDetailedDtoTypeEnum.Jstask}        | ${{}}                                   | ${CODING_TASK_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Kotlintask}    | ${{}}                                   | ${CODING_TASK_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Objctask}      | ${{}}                                   | ${CODING_TASK_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Cvmarkdown}    | ${{}}                                   | ${{}}
      ${CourseTaskDetailedDtoTypeEnum.Cvhtml}        | ${{}}                                   | ${{}}
    `(
      'should return data for $type',
      async ({ type, values, result }: { type: CourseTaskDetailedDtoTypeEnum; values: any; result: any }) => {
        const courseTask = generateCourseTask(type);
        const { collectData } = renderUseCourseTaskSubmit(courseTask);

        const data = await collectData(values);

        expect(data).toStrictEqual(result);
      },
    );

    it(`should trigger file upload when task is ${CourseTaskDetailedDtoTypeEnum.Ipynb}`, async () => {
      const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Ipynb);
      const { collectData } = renderUseCourseTaskSubmit(courseTask);

      await collectData(FILE_VALUE_MOCK);

      expect(uploadFileMock).toHaveBeenCalled();
    });
  });
});

function renderUseCourseTaskSubmit(courseTask: CourseTaskDetailedDto) {
  const {
    result: { current },
  } = renderHook(() => useCourseTaskSubmit(courseTask));

  return { ...current };
}

function generateCourseTask(type: CourseTaskDetailedDtoTypeEnum): CourseTaskDetailedDto {
  return {
    id: 10,
    name: `Course task ${type}`,
    type,
    checker: 'auto-test',
    studentEndDate: '2022-10-10T00:00.000Z',
    githubRepoName: 'github-repo-name',
    sourceGithubRepoUrl: 'source-github-repo-url',
  } as CourseTaskDetailedDto;
}
