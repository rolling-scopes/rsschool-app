import { renderHook } from '@testing-library/react-hooks';
import { CourseTaskDetailedDto, CourseTaskDetailedDtoTypeEnum } from 'api';
import { IpynbFile, useCourseTaskSubmit } from './useCourseTaskSubmit';
import { FilesService } from 'services/files';
import { CourseService } from 'services/course';
import { act } from 'react-dom/test-utils';
import { AxiosError } from 'axios';
import { notification } from 'antd';
import * as UserUtils from 'domain/user';

jest.mock('services/files');
jest.mock('services/course');
jest.mock('domain/user');

const uploadFileMock = jest.fn().mockImplementation(() => ({ s3Key: 'some-string' }));
(FilesService as jest.Mock).mockImplementation(() => ({ uploadFile: uploadFileMock }));

const FILE_VALUE_MOCK = {
  upload: {
    file: {
      originFileObj: new File([new Blob(['blob-blob'])], 'file-name'),
    },
  },
} as IpynbFile;
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
      const postTaskVerificationMock = jest.fn().mockResolvedValueOnce(() => ({ courseTask: { type } }));
      (CourseService as jest.Mock).mockImplementationOnce(() => ({ postTaskVerification: postTaskVerificationMock }));

      const courseTask = generateCourseTask(type);
      const { submit } = renderUseCourseTaskSubmit(courseTask);

      await act(async () => {
        await submit(values);
      });

      expect(postTaskVerificationMock).toHaveBeenCalledWith(courseTask.id, result);
    },
  );

  it(`should trigger file upload when task is ${CourseTaskDetailedDtoTypeEnum.Ipynb}`, async () => {
    const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Ipynb);
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit(FILE_VALUE_MOCK);
    });

    expect(uploadFileMock).toHaveBeenCalled();
  });

  describe('when request failed', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it.each`
      statusCode | message
      ${401}     | ${'Your authorization token has expired. You need to re-login in the application.'}
      ${429}     | ${'Please wait. You will be able to submit your task again when the current verification is completed.'}
      ${423}     | ${'Please reload page. This task was expired for submit.'}
      ${500}     | ${'An error occurred. Please try later.'}
    `(
      'and status code is $statusCode should trigger error notification',
      async ({ statusCode, message }: { statusCode: number; message: string }) => {
        const error = generateAxiosError(statusCode);
        const notificationMock = jest.fn();
        jest.spyOn(CourseService.prototype, 'postTaskVerification').mockRejectedValueOnce(error);
        jest.spyOn(notification, 'error').mockImplementationOnce(() => notificationMock);

        const courseTask = generateCourseTask();
        const { submit } = renderUseCourseTaskSubmit(courseTask);

        await act(async () => {
          await submit({});
        });

        expect(notification.error).toHaveBeenCalledWith({
          message,
          duration: statusCode === 401 ? null : undefined,
        });
      },
    );

    it.each`
      isExpelled | perHour      | message
      ${true}    | ${undefined} | ${'This task can only be submitted by active students.'}
      ${false}   | ${undefined} | ${'You can submit this task only 4 times.  For now your attempts limit is over!'}
      ${false}   | ${1}         | ${'You can submit this task only 4 times. You can submit this task not more than one time per 1 hours. For now your attempts limit is over!'}
    `(
      `and status code is 403 should trigger error notification`,
      async ({ isExpelled, perHour, message }: { isExpelled: boolean; perHour: number; message: string }) => {
        const error = generateAxiosError(403);
        jest.spyOn(UserUtils, 'isExpelledStudent').mockImplementationOnce(() => isExpelled);
        jest.spyOn(CourseService.prototype, 'postTaskVerification').mockRejectedValueOnce(error);
        jest.spyOn(notification, 'error').mockImplementationOnce(() => jest.fn());

        const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Jstask, perHour);
        const { submit } = renderUseCourseTaskSubmit(courseTask);

        await act(async () => {
          await submit({});
        });

        expect(notification.error).toHaveBeenCalledWith({
          message,
          duration: undefined,
        });
      },
    );
  });
});

function renderUseCourseTaskSubmit(courseTask: CourseTaskDetailedDto) {
  const {
    result: { current },
  } = renderHook(() => useCourseTaskSubmit(100, courseTask, jest.fn()));

  return { ...current };
}

function generateCourseTask(
  type: CourseTaskDetailedDtoTypeEnum = CourseTaskDetailedDtoTypeEnum.Jstask,
  oneAttemptPerNumberOfHours?: number,
): CourseTaskDetailedDto {
  return {
    id: 10,
    name: `Course task ${type}`,
    type,
    checker: 'auto-test',
    studentEndDate: '2022-10-10T00:00.000Z',
    githubRepoName: 'github-repo-name',
    sourceGithubRepoUrl: 'source-github-repo-url',
    publicAttributes: {
      maxAttemptsNumber: 4,
      oneAttemptPerNumberOfHours,
    },
  } as CourseTaskDetailedDto;
}

function generateAxiosError(code: number): AxiosError {
  return {
    isAxiosError: true,
    response: {
      status: code,
    },
  } as AxiosError;
}
