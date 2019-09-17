import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';

import { setResponse } from '../utils';
import { Student } from '../../models';
import { ILogger } from '../../logger';
import { taskService, awsTaskService } from '../../services';

export const postTaskVerification = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const courseTaskId: number = Number(ctx.params.id);

  const inputData: any = ctx.request.body;
  const { githubId, id } = ctx.state.user;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (!courseTask || !courseTask.task) {
    setResponse(ctx, BAD_REQUEST, { message: 'Not valid course task' });
    return;
  }

  const student = await getRepository(Student).findOne({
    where: { userId: id, courseId },
  });
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
      type: 'externaltask',
    },
  };

  await awsTaskService.postTaskVerification(result);

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
