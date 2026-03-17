import { message } from 'antd';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { CourseTaskVerificationsApi, TaskVerificationAttemptDto } from '@client/api';
import { AxiosError } from 'axios';

export function useVerificationsAnswers(courseId: number, courseTaskId: number) {
  const [answers, setAnswers] = useState<TaskVerificationAttemptDto[] | null>(null);
  const showAnswersRequest = useRequest(
    async () => {
      const result = await new CourseTaskVerificationsApi().getAnswers(courseId, courseTaskId);
      setAnswers(result.data);
    },
    {
      manual: true,
      onError: e => {
        const error = e as AxiosError<Error>;
        message.error(error.response?.data?.message || error?.message);
      },
    },
  );

  const hideAnswers = () => {
    setAnswers(null);
  };

  return {
    loading: showAnswersRequest.loading,
    answers,
    showAnswers: showAnswersRequest.runAsync,
    hideAnswers,
  };
}
