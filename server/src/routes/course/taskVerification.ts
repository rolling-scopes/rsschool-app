import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';

import { setResponse } from '../utils';
import { Student } from '../../models';
import { ILogger } from '../../logger';
import { taskService } from '../../services';

type Input = {
  courseTaskId: number | string;
  data: any;
};

export const postTaskCheck = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const inputData: Input = ctx.request.body;
  const courseTaskId = Number(inputData.courseTaskId);

  const { githubId, id } = ctx.state.user;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (!courseTask || !courseTask.task || !courseTask.task.githubRepoName) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const student = await getRepository(Student).findOne({
    where: { userId: id, courseId },
  });
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'no student' });
    return;
  }

  const taskCheckEvent: TaskEvent = {
    githubId,
    studentId: student.id,
    courseTask: {
      ...inputData.data,
      id: courseTask.id,
      type: 'externaltask',
    },
  };
  setResponse(ctx, OK, taskCheckEvent);
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
