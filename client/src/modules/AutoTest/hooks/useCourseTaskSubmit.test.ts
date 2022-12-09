import { renderHook } from '@testing-library/react-hooks';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { useCourseTaskSubmit } from './useCourseTaskSubmit';
import { FilesService } from 'services/files';
import { CourseService } from 'services/course';
import { act } from 'react-dom/test-utils';

jest.mock('services/files');
jest.mock('services/course');

const uploadFileMock = jest.fn().mockImplementation(() => ({ s3Key: 'some-string' }));
(FilesService as jest.Mock).mockImplementation(() => ({ uploadFile: uploadFileMock }));

const COURSE_ID_MOCK = 100;
const FILE_VALUE_MOCK = {
  upload: {
    file: {
      originFileObj: new File([new Blob(['blob-blob'])], 'file-name'),
    },
  },
};
const SELF_EDUCATION_MOCK = { ['answer-0']: 1, ['answer-1']: 2 };

const CODING_RESULT = {
  githubRepoName: 'github-repo-name',
  sourceGithubRepoUrl: 'source-github-repo-url',
};
const CODEWARS_RESULT = { deadline: '2022-10-10T00:00.000Z' };
const SELF_EDUCATION_RESULT = [
  { index: 0, value: 1 },
  { index: 1, value: 2 },
];
const IPYNB_RESULT = { s3Key: expect.any(String), taskName: 'course_task_ipynb' };

describe('useCourseTaskSubmit', () => {
  describe('collectData', () => {
    it.each`
      type                                           | values                 | result
      ${CourseTaskDetailedDtoTypeEnum.Ipynb}         | ${FILE_VALUE_MOCK}     | ${IPYNB_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${SELF_EDUCATION_MOCK} | ${SELF_EDUCATION_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Codewars}      | ${{}}                  | ${CODEWARS_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Jstask}        | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Kotlintask}    | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Objctask}      | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Cvmarkdown}    | ${{}}                  | ${{}}
      ${CourseTaskDetailedDtoTypeEnum.Cvhtml}        | ${{}}                  | ${{}}
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

  describe('submit', () => {
    it.each`
      type                                           | values                 | result
      ${CourseTaskDetailedDtoTypeEnum.Ipynb}         | ${FILE_VALUE_MOCK}     | ${IPYNB_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Selfeducation} | ${SELF_EDUCATION_MOCK} | ${SELF_EDUCATION_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Codewars}      | ${{}}                  | ${CODEWARS_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Jstask}        | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Kotlintask}    | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Objctask}      | ${{}}                  | ${CODING_RESULT}
      ${CourseTaskDetailedDtoTypeEnum.Cvmarkdown}    | ${{}}                  | ${{}}
      ${CourseTaskDetailedDtoTypeEnum.Cvhtml}        | ${{}}                  | ${{}}
    `(
      'should post task verification for $type',
      async ({ type, values, result }: { type: CourseTaskDetailedDtoTypeEnum; values: any; result: any }) => {
        const postTaskVerificationMock = jest.fn().mockImplementationOnce(() => ({ courseTask: { type } }));
        (CourseService as jest.Mock).mockImplementationOnce(() => ({ postTaskVerification: postTaskVerificationMock }));

        const courseTask = generateCourseTask(type);
        const { submit } = renderUseCourseTaskSubmit(courseTask);

        await act(async () => {
          await submit(values);
        });

        expect(postTaskVerificationMock).toHaveBeenCalledWith(courseTask.id, result);
      },
    );

    // TODO: test errors
  });
});

function renderUseCourseTaskSubmit(courseTask: CourseTaskDetailedDto) {
  const {
    result: { current },
  } = renderHook(() => useCourseTaskSubmit(COURSE_ID_MOCK, courseTask));

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
