import axios from 'axios';
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
  return axios.post(`${config.aws.taskApiUrl}/task`, data, {
    headers: { 'x-api-key': config.aws.taskApiKey },
  });
}
