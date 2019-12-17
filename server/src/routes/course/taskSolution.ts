import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import _ from 'lodash';
import { getRepository } from 'typeorm';
import { shuffleRec } from '../../lib/distribution';
import { ILogger } from '../../logger';
import { IUserSession, TaskSolution, TaskSolutionChecker, TaskSolutionResult } from '../../models';
import { courseService, taskResultsService, taskService } from '../../services';
import { setResponse, setErrorResponse } from '../utils';

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
    setErrorResponse(ctx, BAD_REQUEST, 'not valid student or course task');
    return;
  }
  if (courseTask.checker !== 'crossCheck') {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution is supported for this task');
    return;
  }
  const taskChecker = await taskResultsService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
  if (taskChecker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'no assigned cross-check');
    return;
  }

  const inputData: InputResult = ctx.request.body;
  const data = { score: inputData.score, comment: inputData.comment || '' };

  if (!data.score) {
    setErrorResponse(ctx, BAD_REQUEST, 'no score provided');
    return;
  }

  const historicalResult = { ...data, authorId: user.id, dateTime: Date.now() };
  const existingResult = await taskResultsService.getTaskSolutionResult(student.id, checker.id, courseTask.id);
  if (existingResult != null) {
    existingResult.historicalScores.push(historicalResult);
    await getRepository(TaskSolutionResult).update(existingResult.id, {
      ...data,
      historicalScores: existingResult.historicalScores,
    });
    setResponse(ctx, OK);
    return;
  }

  await getRepository(TaskSolutionResult).insert({
    studentId: taskChecker.studentId,
    checkerId: taskChecker.checkerId,
    courseTaskId: taskChecker.courseTaskId,
    historicalScores: [historicalResult],
    ...data,
  });
  setResponse(ctx, OK);
};

export const getTaskSolutionResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;
  const { user } = ctx.state as { user: IUserSession };
  const [student, checker, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.queryStudentByGithubId(courseId, user.githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null || checker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'not valid student or course task');
    return;
  }
  if (courseTask.checker !== 'crossCheck') {
    setErrorResponse(ctx, BAD_REQUEST, 'task solution is supported for this task');
    return;
  }
  const taskChecker = await taskResultsService.getTaskSolutionChecker(student.id, checker.id, courseTaskId);
  if (taskChecker == null) {
    setErrorResponse(ctx, BAD_REQUEST, 'no assigned cross-check');
    return;
  }
  const existingResult = await taskResultsService.getTaskSolutionResult(
    taskChecker.studentId,
    taskChecker.checkerId,
    taskChecker.courseTaskId,
  );
  setResponse(ctx, OK, existingResult);
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

export const postTaskSolutionCompletion = (__: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const studentScores = await courseService.getTaskSolutionCheckers(courseTaskId);
  for (const studentScore of studentScores) {
    const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
    await taskResultsService.saveScore(studentScore.studentId, courseTaskId, data);
  }
  setResponse(ctx, OK);
};
