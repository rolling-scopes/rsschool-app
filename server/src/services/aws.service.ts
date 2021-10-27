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
    if (config.isDevMode) {
      return;
    }
    return axios.post<any>(`${config.aws.restApiUrl}/task`, data, {
      headers: { 'x-api-key': config.aws.restApiKey },
    });
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}

export async function uploadFileByGithubId(githubId: string, key: string, data: string) {
  try {
    // if (config.isDevMode) {
    //   return;
    // }
    const response = await axios.post<any>(`${config.aws.restApiUrl}/upload?key=${key}&githubId=${githubId}`, data, {
      headers: { 'x-api-key': config.aws.restApiKey },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    throw error.response?.data ?? error.message;
  }
}
