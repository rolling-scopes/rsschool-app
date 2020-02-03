import axios, { AxiosError } from 'axios';
import { config } from '../config';

type TaskVerificationEvent = {
  studentId: number;
  githubId: string;
  courseTask: {
    id: number;
    type: string;
  };
};

export async function postTaskVerification(data: TaskVerificationEvent[]) {
  try {
    return axios.post(`${config.aws.taskApiUrl}/task`, data, {
      headers: { 'x-api-key': config.aws.taskApiKey },
    });
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}
