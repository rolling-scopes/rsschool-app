import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import _ from 'lodash';
import { getRepository } from 'typeorm';
import { shuffleRec } from '../../lib/distribution';
import { ILogger } from '../../logger';
import { IUserSession, TaskSolution, TaskSolutionChecker, TaskSolutionResult } from '../../models';
import { courseService, taskResultsService, taskService } from '../../services';
import { setResponse } from '../utils';

const MIN_CHECKERS = 3;

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

  const existingResult = await taskResultsService.getTaskSolution(student.id, courseTask.id);
  if (existingResult != null) {
    await getRepository(TaskSolution).save({ ...existingResult, ...data });
    setResponse(ctx, OK, {});
    return;
  }

  await getRepository(TaskSolution).save({ studentId: student.id, courseTaskId: courseTask.id, url: data.url });
  setResponse(ctx, OK, {});
};

export const postTaskSolutionDistribution = (__: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const taskSolutions = await courseService.getTaskSolutionsWithoutChecker(courseTaskId);

  const students = taskSolutions.map(t => t.studentId);
  let allStudents: number[] = [];

  _.times(MIN_CHECKERS, () => (allStudents = allStudents.concat(students)));

  students.concat(students).concat(students);
  const randomStudents = shuffleRec(allStudents);

  const createPair = (pairs: Partial<TaskSolutionChecker>[], studentId: number): Partial<TaskSolutionChecker>[] => {
    if (randomStudents.length > 0) {
      const randomStudentId = randomStudents.shift();
      if (randomStudentId === studentId) {
        if (randomStudents.some(s => s !== studentId)) {
          randomStudents.push(randomStudentId);
          return createPair(pairs, studentId);
        }
        return pairs;
      }
      if (randomStudentId) {
        pairs.push({
          courseTaskId,
          checkerId: studentId,
          studentId: randomStudentId,
          taskSolutionId: taskSolutions.find(t => t.studentId === randomStudentId)?.id,
        });
      }
      return pairs;
    }
    return pairs;
  };

  let pairs: Partial<TaskSolutionChecker>[] = [];

  for (const studentId of students) {
    _.times(MIN_CHECKERS, () => {
      pairs = createPair(pairs, studentId);
    });
  }
  await getRepository(TaskSolutionChecker).save(pairs);
  setResponse(ctx, OK, { pairs });
};

type InputResult = { score: number; comment: string };
export const postTaskSolutionResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };
  const [student, checker, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.queryStudentByGithubId(courseId, user.githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null || checker == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }
  if (courseTask.checker !== 'crossCheck') {
    setResponse(ctx, BAD_REQUEST, { message: 'task solution is supported for this task' });
    return;
  }
  const taskChecker = taskResultsService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
  if (taskChecker == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'no assigned cross-check' });
    return;
  }

  const inputData: InputResult = ctx.request.body;
  const data = { score: inputData.score, comment: inputData.comment || '' };

  if (!data.score) {
    setResponse(ctx, BAD_REQUEST, { message: 'no score provided' });
    return;
  }

  const historicalResult = { ...data, authorId: user.id, dateTime: Date.now() };
  const existingResult = await taskResultsService.getTaskSolutionResult(student.id, checker.id, courseTask.id);
  if (existingResult != null) {
    existingResult.historicalScores.push(historicalResult);
    await getRepository(TaskSolutionResult).save({ ...existingResult, ...data });
    setResponse(ctx, OK, {});
    return;
  }

  await getRepository(TaskSolutionResult).save({
    studentId: student.id,
    checkerId: checker.id,
    courseTaskId: courseTask.id,
    historicalScores: [historicalResult],
    ...data,
  });
  setResponse(ctx, OK);
};

export const getTaskSolutionAssignments = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;
  const [student, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }
  if (courseTask.checker !== 'crossCheck') {
    setResponse(ctx, BAD_REQUEST, { message: 'task solution is supported for this task' });
    return;
  }
  const records = await taskResultsService.getTaskSolutionAssignments(student.id, courseTaskId);
  const result = records.map(r => ({
    student: courseService.convertToStudentBasic(r.student),
    url: r.taskSolution.url,
  }));
  setResponse(ctx, OK, result);
};
