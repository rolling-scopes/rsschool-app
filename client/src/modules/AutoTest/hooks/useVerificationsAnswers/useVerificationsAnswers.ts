import { message } from 'antd';
import { useState } from 'react';
import { CourseTaskVerificationsApi, TaskVerificationAttemptDto } from '@client/api';
import { AxiosError } from 'axios';
import { useLoading } from 'components/useLoading';

export function useVerificationsAnswers(courseId: number, courseTaskId: number) {
  const [answers, setAnswers] = useState<TaskVerificationAttemptDto[] | null>(null);
  const [loading, withLoading] = useLoading(false, e => {
    const error = e as AxiosError<any>;
    message.error(error.response?.data?.message || error?.message);
  });

  const showAnswers = withLoading(async () => {
    const result = await new CourseTaskVerificationsApi().getAnswers(courseId, courseTaskId);
    setAnswers(result.data);
  });

  const hideAnswers = () => {
    setAnswers(null);
  };

  return { loading, answers, showAnswers, hideAnswers };
}
