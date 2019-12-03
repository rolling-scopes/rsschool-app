import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { TaskSolution } from '../../models';
import { courseService, taskResultsService, taskService } from '../../services';
import { setResponse } from '../utils';

type Input = { url: string };

export const postTaskSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;

  const [student, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }

  const inputData: Input = ctx.request.body;
  const data = {
    url: inputData.url || undefined,
  };

  if (courseTask.checker !== 'crossCheck') {
    setResponse(ctx, BAD_REQUEST, { message: 'task solution is supported for this task' });
    return;
  }

  const existingResult = await taskResultsService.getStudentTaskSolution(student.id, courseTask.id);
  if (existingResult != null) {
    await getRepository(TaskSolution).save({ ...existingResult, ...data });
    setResponse(ctx, OK, {});
    return;
  }

  await getRepository(TaskSolution).save({ studentId: student.id, courseTaskId: courseTask.id, url: data.url });
  setResponse(ctx, OK, {});
};
