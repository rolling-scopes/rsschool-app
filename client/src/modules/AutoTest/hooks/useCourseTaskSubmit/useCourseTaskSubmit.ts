import { Form, notification } from 'antd';
import { CourseTaskDetailedDtoTypeEnum } from 'api';
import snakeCase from 'lodash/snakeCase';
import { useContext, useMemo, useState } from 'react';
import { FilesService } from 'services/files';
import { CourseService, SelfEducationPublicAttributes } from 'services/course';
import { AxiosError } from 'axios';
import { isExpelledStudent } from 'domain/user';
import { SessionContext } from 'modules/Course/contexts';
import { InternalUploadFile } from 'antd/lib/upload/interface';
import { useBeforeUnload } from 'react-use';
import { CourseTaskVerifications } from '../../types';

type SelfEducationValues = Record<string, number>;
export type IpynbFile = { upload: { file: InternalUploadFile } };
type FormValues = SelfEducationValues | IpynbFile;

function isIpynbFile(item: unknown): item is IpynbFile {
  return !!item && typeof item === 'object' && 'upload' in item;
}

export function useCourseTaskSubmit(
  courseId: number,
  courseTask: CourseTaskVerifications,
  reloadVerifications: () => void,
) {
  const session = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const courseService = useMemo(() => new CourseService(courseId), [courseId]);

  useBeforeUnload(isModified, 'You have changes in test. Do you really want to close this page?');

  const uploadIpynbFile = async (values: FormValues): Promise<string | undefined> => {
    if (isIpynbFile(values)) {
      const filesService = new FilesService();
      const fileData = await readFile(values.upload.file);
      const { s3Key } = await filesService.uploadFile('', fileData);
      return s3Key;
    }
  };

  const getData = async (values: FormValues) => {
    switch (courseTask.type) {
      case CourseTaskDetailedDtoTypeEnum.Ipynb: {
        const s3Key = await uploadIpynbFile(values);
        return {
          s3Key,
          taskName: snakeCase(courseTask.name),
        };
      }

      case CourseTaskDetailedDtoTypeEnum.Selfeducation: {
        return Object.entries(values)
          .filter(([key]) => /answer/.test(key))
          .map(([key, value]) => {
            const [, index = 0] = key.match(/answer-(.*)$/) || [];
            return { index: Number(index), value };
          });
      }

      case CourseTaskDetailedDtoTypeEnum.Codewars: {
        return {
          deadline: courseTask.studentEndDate,
        };
      }

      case CourseTaskDetailedDtoTypeEnum.Jstask:
      case CourseTaskDetailedDtoTypeEnum.Kotlintask:
      case CourseTaskDetailedDtoTypeEnum.Objctask:
        return {
          githubRepoName: courseTask.githubRepoName,
          sourceGithubRepoUrl: courseTask.sourceGithubRepoUrl,
        };

      case CourseTaskDetailedDtoTypeEnum.Cvmarkdown:
      case CourseTaskDetailedDtoTypeEnum.Cvhtml:
        return {};

      default:
        return null;
    }
  };

  const getError = (error: AxiosError<any>): string => {
    switch (error.response?.status) {
      case 401:
        return 'Your authorization token has expired. You need to re-login in the application.';

      case 429:
        return 'Please wait. You will be able to submit your task again when the current verification is completed.';

      case 423:
        return 'Please reload page. This task was expired for submit.';

      case 403: {
        if (isExpelledStudent(session, courseId)) {
          return 'This task can only be submitted by active students.';
        } else {
          const { oneAttemptPerNumberOfHours, maxAttemptsNumber = 0 } = (courseTask?.publicAttributes ??
            {}) as SelfEducationPublicAttributes;
          const timeLimitedAttempts = oneAttemptPerNumberOfHours
            ? `You can submit this task not more than one time per ${oneAttemptPerNumberOfHours} hours.`
            : '';
          return `You can submit this task only ${maxAttemptsNumber} times. ${timeLimitedAttempts} For now your attempts limit is over!`;
        }
      }

      default:
        return 'An error occurred. Please try later.';
    }
  };

  const submit = async (values: FormValues) => {
    setLoading(true);

    const data = await getData(values);

    if (!data) {
      return;
    }

    try {
      const {
        courseTask: { type },
      } = await courseService.postTaskVerification(courseTask.id, data);

      if (type === CourseTaskDetailedDtoTypeEnum.Selfeducation) {
        notification.success({ message: 'The task has been submitted.' });
      } else {
        notification.success({ message: 'The task has been submitted for verification and it will be checked soon.' });
      }

      reloadVerifications();
      setIsModified(false);
    } catch (e) {
      const error = e as AxiosError<any>;
      const message = getError(error as AxiosError<any>);

      notification.error({
        message,
        // notification will never be closed automatically when status is 401
        duration: error.response?.status === 401 ? null : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const change = () => {
    setIsModified(true);
  };

  return { form, loading, submit, change };
}

function readFile(file: any) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file?.originFileObj, 'utf-8');
    reader.onload = ({ target }) => resolve(target ? (target.result as string) : '');
    reader.onerror = e => reject(e);
  });
}
