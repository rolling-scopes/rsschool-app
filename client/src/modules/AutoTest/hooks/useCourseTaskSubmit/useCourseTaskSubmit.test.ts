import { renderHook } from '@testing-library/react';
import { CourseTaskDetailedDtoTypeEnum, CourseTaskVerificationsApi } from '@client/api';
import { IpynbFile, useCourseTaskSubmit } from './useCourseTaskSubmit';
import { FilesService } from '@client/services/files';
import { act } from 'react-dom/test-utils';
import { AxiosError } from 'axios';
import * as UserUtils from '@client/domain/user';
import { CourseTaskVerifications } from '@client/modules/AutoTest/types';

vi.mock('@client/services/files', () => ({
  FilesService: vi.fn(),
}));
vi.mock('@client/domain/user');
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockCourseTaskVerificationsApi() {}
  MockCourseTaskVerificationsApi.prototype.createTaskVerification = vi.fn();
  return {
    ...actual,
    CourseTaskVerificationsApi: MockCourseTaskVerificationsApi,
  };
});

const mockErrorNotification = vi.fn();
const mockSuccessNotification = vi.fn();

vi.mock('@client/hooks/useMessage', () => ({
  useMessage: () => ({
    notification: {
      error: mockErrorNotification,
      success: mockSuccessNotification,
    },
  }),
}));

const uploadFileMock = vi.fn().mockImplementation(() => ({ s3Key: 'some-string' }));
vi.mocked(FilesService).mockImplementation(function () {
  return { uploadFile: uploadFileMock };
});

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
      const createTaskVerificationMock = vi
        .spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification')
        .mockResolvedValueOnce({ data: { courseTask: { type } } });

      const courseTask = generateCourseTask(type);
      const { submit } = renderUseCourseTaskSubmit(courseTask);

      await act(async () => {
        await submit(values);
      });

      expect(createTaskVerificationMock).toHaveBeenCalledWith(100, courseTask.id, result);
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

  it('should show the plain submitted message when the verification has no id', async () => {
    vi.clearAllMocks();
    vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification').mockResolvedValueOnce({
      data: {},
    });
    const courseTask = generateCourseTask();
    const { submit, finishTask } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit({});
    });

    expect(mockSuccessNotification).toHaveBeenCalledWith({ message: 'The task has been submitted.' });
    expect(finishTask).toHaveBeenCalledTimes(1);
  });

  it('should show the "for verification" message when the verification has an id', async () => {
    vi.clearAllMocks();
    vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification').mockResolvedValueOnce({
      data: { id: 5 },
    });
    const courseTask = generateCourseTask();
    const { submit, finishTask } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit({});
    });

    expect(mockSuccessNotification).toHaveBeenCalledWith({
      message: 'The task has been submitted for verification and it will be checked soon.',
    });
    expect(finishTask).toHaveBeenCalledTimes(1);
  });

  it('should not call the verification API for an unsupported task type (null submit data)', async () => {
    vi.clearAllMocks();
    const createTaskVerificationSpy = vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification');
    // CourseTaskDetailedDtoTypeEnum.Test is not handled in getSubmitData => returns null
    const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Test);
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit({});
    });

    expect(createTaskVerificationSpy).not.toHaveBeenCalled();
  });

  it('should keep an unclosable (duration:false) notification on a 401 error', async () => {
    vi.clearAllMocks();
    vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification').mockRejectedValueOnce(
      generateAxiosError(401),
    );
    const courseTask = generateCourseTask();
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit({});
    });

    expect(mockErrorNotification).toHaveBeenCalledWith(expect.objectContaining({ duration: false }));
  });

  it('should mark the form as modified when change is called', () => {
    const courseTask = generateCourseTask();
    const { change } = renderUseCourseTaskSubmit(courseTask);

    expect(() => act(() => change())).not.toThrow();
  });

  it('should default the answer index to 0 when a self-education key has no numeric suffix', async () => {
    vi.clearAllMocks();
    const createTaskVerificationSpy = vi
      .spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification')
      .mockResolvedValueOnce({ data: { id: 1 } });
    const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Selfeducation);
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    // key `answer` matches /answer/ but not /answer-(.*)$/, so the `|| []` + default `index = 0` runs.
    await act(async () => {
      await submit({ answer: 7 } as unknown as Record<string, number>);
    });

    expect(createTaskVerificationSpy).toHaveBeenCalledWith(100, courseTask.id, [{ index: 0, value: 7 }]);
  });

  it('should fall back to 0 attempts on a 403 error when the task has no public attributes', async () => {
    vi.clearAllMocks();
    vi.spyOn(UserUtils, 'isExpelledStudent').mockReturnValueOnce(false);
    vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification').mockRejectedValueOnce(
      generateAxiosError(403),
    );
    const courseTask = {
      id: 10,
      name: 'no-attrs',
      type: CourseTaskDetailedDtoTypeEnum.Jstask,
    } as CourseTaskVerifications;
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    await act(async () => {
      await submit({});
    });

    expect(mockErrorNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'You can submit this task only 0 times.  For now your attempts limit is over!',
      }),
    );
  });

  it('should not upload when an ipynb submit value is not a file', async () => {
    vi.clearAllMocks();
    const createTaskVerificationSpy = vi
      .spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification')
      .mockResolvedValueOnce({ data: { id: 1 } });
    const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Ipynb);
    const { submit } = renderUseCourseTaskSubmit(courseTask);

    // not an IpynbFile => uploadIpynbFile returns undefined (isIpynbFile false branch)
    await act(async () => {
      await submit({} as unknown as IpynbFile);
    });

    expect(uploadFileMock).not.toHaveBeenCalled();
    expect(createTaskVerificationSpy).toHaveBeenCalledWith(100, courseTask.id, {
      s3Key: undefined,
      taskName: 'course_task_ipynb',
    });
  });

  it('should ignore a second submit while a previous one is still loading', async () => {
    vi.clearAllMocks();
    let resolveCreate: (value: unknown) => void = () => {};
    vi.spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification').mockImplementationOnce(
      () => new Promise(resolve => (resolveCreate = resolve)),
    );
    const courseTask = generateCourseTask();
    const { result } = renderUseCourseTaskSubmit(courseTask);

    let firstSubmit: Promise<void>;
    act(() => {
      firstSubmit = result.current.submit({});
    });

    // loading is now true; a second submit must early-return without a new API call.
    await act(async () => {
      await result.current.submit({});
    });
    expect(CourseTaskVerificationsApi.prototype.createTaskVerification).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveCreate({ data: { id: 1 } });
      await firstSubmit;
    });
  });

  describe('when request failed', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it.each`
      statusCode | _message
      ${401}     | ${'Your authorization token has expired. You need to re-login in the application.'}
      ${429}     | ${'Please wait. You will be able to submit your task again when the current verification is completed.'}
      ${423}     | ${'Please reload page. This task was expired for submit.'}
      ${500}     | ${'An error occurred. Please try later.'}
    `(
      'and status code is $statusCode should trigger error notification',
      async ({ statusCode }: { statusCode: number }) => {
        const error = generateAxiosError(statusCode);
        const createTaskVerificationSpy = vi
          .spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification')
          .mockRejectedValueOnce(error);

        const courseTask = generateCourseTask();
        const { submit, finishTask, result } = renderUseCourseTaskSubmit(courseTask);

        await act(async () => {
          await submit({});
        });

        expect(createTaskVerificationSpy).toHaveBeenCalledTimes(1);
        expect(finishTask).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
      },
    );

    it.each`
      isExpelled | perHour      | _message
      ${true}    | ${undefined} | ${'This task can only be submitted by active students.'}
      ${false}   | ${undefined} | ${'You can submit this task only 4 times.  For now your attempts limit is over!'}
      ${false}   | ${1}         | ${'You can submit this task only 4 times. You can submit this task not more than one time per 1 hours. For now your attempts limit is over!'}
    `(
      `and status code is 403 should trigger error notification`,
      async ({ isExpelled, perHour }: { isExpelled: boolean; perHour: number }) => {
        const error = generateAxiosError(403);
        vi.spyOn(UserUtils, 'isExpelledStudent').mockImplementationOnce(() => isExpelled);
        const createTaskVerificationSpy = vi
          .spyOn(CourseTaskVerificationsApi.prototype, 'createTaskVerification')
          .mockRejectedValueOnce(error);

        const courseTask = generateCourseTask(CourseTaskDetailedDtoTypeEnum.Jstask, perHour);
        const { submit, finishTask, result } = renderUseCourseTaskSubmit(courseTask);

        await act(async () => {
          await submit({});
        });

        expect(createTaskVerificationSpy).toHaveBeenCalledTimes(1);
        expect(finishTask).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(false);
      },
    );
  });
});

function renderUseCourseTaskSubmit(courseTask: CourseTaskVerifications) {
  const finishTask = vi.fn();
  const { result: view } = renderHook(() => useCourseTaskSubmit(100, courseTask, finishTask));

  return { ...view.current, result: view, finishTask };
}

function generateCourseTask(
  type: CourseTaskDetailedDtoTypeEnum = CourseTaskDetailedDtoTypeEnum.Jstask,
  oneAttemptPerNumberOfHours?: number,
): CourseTaskVerifications {
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
  } as CourseTaskVerifications;
}

function generateAxiosError(code: number): AxiosError {
  return {
    isAxiosError: true,
    response: {
      status: code,
    },
  } as AxiosError;
}
