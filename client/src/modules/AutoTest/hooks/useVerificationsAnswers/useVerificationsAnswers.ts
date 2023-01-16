import { message } from 'antd';
import { useEffect, useState } from 'react';
import { CourseTaskVerificationsApi, TaskVerificationAttemptDto } from 'api';
import { AxiosError } from 'axios';

export function useVerificationsAnswers(courseId: number, courseTaskId: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError<any> | null>(null);
  const [answers, setAnswers] = useState<TaskVerificationAttemptDto[] | null>(null);

  useEffect(() => {
    if (error) {
      message.error(error.response?.data?.message || error?.message);
    }
  }, [error]);

  function showAnswers() {
    async function loadData() {
      setLoading(true);

      try {
        const result = await new CourseTaskVerificationsApi().getAnswers(courseId, courseTaskId);
        setAnswers(result.data);
      } catch (error) {
        setError(error as AxiosError<any>);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }

  function hideAnswers() {
    setAnswers(null);
  }

  return { loading, answers, showAnswers, hideAnswers };
}
