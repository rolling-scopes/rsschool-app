import nodeFetch from 'node-fetch';
import { Student, Result, Service } from '../interfaces';
import { AUTH_TOKEN, REQUESTS } from '../constants/rsschool-api';
import { filterLogin } from './text-utils';
import logger from './logger';

const apiRequest = async (uri: string, param: string = '', body: any = '') => {
  const options: any = {
    headers: {
      Authorization: AUTH_TOKEN,
      'Content-Type': 'application/json; charset=utf-8',
    },
  };

  if (body) {
    options.method = 'POST';
    options.body = body;
  }

  const data = await nodeFetch(uri + param, options);

  let result;
  try {
    result = await data.json();
    return result;
  } catch (error) {
    console.log(`Wrong request to ${data.url}`);
    console.log(`${data.status} ${data.statusText}`);
  }
};

const findTaskByName = async (name: string) => {
  const rawTasks = await apiRequest(REQUESTS.getTasks);
  const task = rawTasks.data.find((task: any) => task.name.toLowerCase() === name.toLowerCase());

  return task;
};

export const getStudents = async (service: string) => {
  const rawStudents = await apiRequest(REQUESTS.getStudents);

  const students = rawStudents.data.map(({ githubId, externalAccounts = [] }: any) => {
    const foundService = externalAccounts.find((student: any) => student.service === service);
    const rawServiceLogin = foundService ? foundService.username : null;
    const serviceLogin = filterLogin(rawServiceLogin);

    const data: Student = {
      serviceLogin,
      githubLogin: githubId,
    };

    if (serviceLogin !== rawServiceLogin) {
      logger.push({
        description: `Wrong ${service} login: ${rawServiceLogin}`,
        githubLogin: githubId,
        serviceLogin: rawServiceLogin,
      });
    }
    return data;
  });

  return students;
};

export const prepareScores = async (service: Service, results: Result[], altName?: string) => {
  const taskName = altName || service.name;
  const courseTaskId = (await findTaskByName(taskName)).courseTaskId;

  const scores = results.map((student: Result) => ({
    courseTaskId,
    studentGithubId: student.github,
    mentorGithubId: null,
    comment: null,
    githubPrUrl: null,
    score: student.score,
  }));

  return scores;
};

export const updateScores = async (scores: any) => {
  try {
    return await apiRequest(REQUESTS.updateScores, '', scores);
  } catch (error) {
    console.log('Error with update scores was occured:');
    console.log(error);
    return [];
  }
};
