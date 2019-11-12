import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import { ILogger } from '../../logger';
import { awsTaskService, courseService, taskService } from '../../services';
import { setResponse } from '../utils';

export const postTaskVerification = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, id } = ctx.params;

  const inputData: any = ctx.request.body;

  const courseTask = await taskService.getCourseTask(id);
  if (!courseTask || !courseTask.task) {
    setResponse(ctx, BAD_REQUEST, { message: 'Not valid course task' });
    return;
  }

  const student = await courseService.getStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'No student' });
    return;
  }
  const result: TaskEvent = {
    githubId,
    studentId: student.id,
    courseTask: {
      ...inputData,
      id: courseTask.id,
      type: courseTask.task.type,
    },
  };
  await awsTaskService.postTaskVerification([result]);
  setResponse(ctx, OK, result);
};

export type TaskEvent = {
  courseTask: JsTask | HtmlTask | ExternalTask;
  studentId: number;
  githubId: string;
};

type JsTask = {
  id: number;
  type: 'jstask';
  githubRepoName: string;
};

type HtmlTask = {
  id: number;
  type: 'htmltask';
  githubPageUrl: string;
};

type ExternalTask = {
  id: number;
  type: 'externaltask';
  codecademy: string;
  htmlacademy: string;
  udemy: string[];
};
