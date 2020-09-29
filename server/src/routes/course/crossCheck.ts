import Router from '@koa/router';
import { BAD_REQUEST, OK, NOT_FOUND } from 'http-status-codes';
import { getRepository} from 'typeorm';
import { ILogger } from '../../logger';
import {
  CourseTask,
  IUserSession, Student,
  TaskResult,
  TaskSolution,
  TaskSolutionChecker,
  TaskSolutionResult, User,
} from '../../models';
import { createCrossCheckPairs } from '../../rules/distribution';
import { courseService, taskResultsService, taskService, notificationService } from '../../services';
import { setErrorResponse, setResponse } from '../utils';

type Input = { url: string };
const defaultPairsCount = 4;

export const createSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
    setResponse(ctx, BAD_REQUEST, { message: 'task solution is not supported for this task' });
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

export const getSolution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params;

  const [student, courseTask] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    taskService.getCourseTask(courseTaskId),
  ]);

  if (student == null || courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or course task' });
    return;
  }

  const result = await taskResultsService.getTaskSolution(student.id, courseTask.id);

  if (result == null) {
    setResponse(ctx, NOT_FOUND, { message: 'solution is not found ' });
    return;
  }

  const { updatedDate, id, url } = result;
  setResponse(ctx, OK, { updatedDate, id, url });
};

export const createDistribution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const solutions = await courseService.getTaskSolutionsWithoutChecker(courseTaskId);
  const solutionsMap = new Map<number, number>();
  for (const solution of solutions) {
    solutionsMap.set(solution.studentId, solution.id);
  }

  const students = Array.from(solutionsMap.keys());
  const pairs = createCrossCheckPairs(students, courseTask.pairsCount ?? defaultPairsCount);

  const crossCheckPairs = pairs
    .filter(pair => solutionsMap.has(pair.studentId))
    .map(pair => ({
      ...pair,
      courseTaskId,
      taskSolutionId: solutionsMap.get(pair.studentId),
    }));

  await getRepository(TaskSolutionChecker).save(crossCheckPairs);
  setResponse(ctx, OK, { crossCheckPairs });
};

export const createResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
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

  const inputData: { score: number; comment: string; anonymous: boolean } = ctx.request.body;
  const data = {
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    anonymous: inputData.anonymous !== false,
  };

  if (isNaN(data.score) || data.score < 0) {
    setErrorResponse(ctx, BAD_REQUEST, 'no score provided');
    return;
  }

  const historicalResult = { ...data, authorId: user.id, dateTime: Date.now() };

  const repository = getRepository(TaskSolutionResult);
  const existing = await taskResultsService.getTaskSolutionResult(student.id, checker.id, courseTask.id);

  if (existing != null) {
    const { historicalScores } = existing;
    historicalScores.push(historicalResult);
    await repository.update(existing.id, { ...data, historicalScores });
    setResponse(ctx, OK);
  } else {
    await repository.insert({
      studentId: taskChecker.studentId,
      checkerId: taskChecker.checkerId,
      courseTaskId: taskChecker.courseTaskId,
      historicalScores: [historicalResult],
      ...data,
    });
  }
  setResponse(ctx, OK);
  const taskResultText = await notificationService.renderTaskResultText(courseTask, data.score);
  await notificationService.sendNotification([githubId], taskResultText);
};

export const getResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
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

export const getAssignments = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
    setResponse(ctx, BAD_REQUEST, { message: 'not supported task' });
    return;
  }
  const records = await taskResultsService.getTaskSolutionAssignments(student.id, courseTaskId);
  const result = records.map(r => ({
    student: courseService.convertToStudentBasic(r.student),
    url: r.taskSolution.url,
  }));
  setResponse(ctx, OK, result);
};

export const createCompletion = (__: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const pairsCount = Math.max((courseTask.pairsCount ?? defaultPairsCount) - 1, 1);
  const studentScores = await courseService.getTaskSolutionCheckers(courseTaskId, pairsCount);

  for (const studentScore of studentScores) {
    const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
    await taskResultsService.saveScore(studentScore.studentId, courseTaskId, data);
  }
  setResponse(ctx, OK);
};

export const getFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
    setResponse(ctx, BAD_REQUEST, { message: 'not supported task' });
    return;
  }

  const feedback = await taskResultsService.getTaskSolutionFeedback(student.id, courseTaskId);
  const response = {
    url: feedback.url,
    comments: feedback.comments,
  };
  setResponse(ctx, OK, response);
};

export const getCrossCheckPairs = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;

  const courseTasks = await getRepository(TaskSolutionResult)
    .createQueryBuilder('tsr')
    .addSelect(['tsr.score'])
    .leftJoin(CourseTask, 'courseTask', '"tsr"."courseTaskId" = "courseTask"."id"')
    .addSelect(['courseTask.id','courseTask.courseId'])
    .leftJoin(TaskResult, 'taskResult', '"taskResult"."courseTaskId" = "courseTask"."id"')
    .leftJoin('courseTask.task', 'task')
    .addSelect(['task.id', 'task.name'])
    .leftJoin(Student, 'st', '"tsr"."studentId" = "st"."id"')
    .leftJoin(User, 'student', '"st"."userId" = "student"."id"')
    .addSelect(['student.id', 'student.githubId'])
    .leftJoin(Student, 'ch', '"tsr"."studentId" = "ch"."id"')
    .leftJoin(User, 'checkerStudent', '"ch"."userId" = "checkerStudent"."id"')
    .addSelect(['checkerStudent.id', 'checkerStudent.githubId'])
    .leftJoin(TaskSolution, 'taskSolution', '"taskSolution"."courseTaskId" = "courseTask"."id" AND "taskSolution"."studentId" = "st"."id"')
    .addSelect(['taskSolution.url'])
    .where(`courseTask.courseId = :courseId`, { courseId })
    .andWhere('courseTask.checker = :checker', { checker: 'crossCheck' })
    // .limit(1)
    // .offset(1)
    .getRawMany();

  const result = courseTasks.map((e: any) => ({
    checkerStudent: {
      githubId: e.checkerStudent_githubId,
      id: e.checkerStudent_id,
    },
    courseTask: {
      courseId: e.courseTask_courseId,
      id: e.courseTask_id,
    },
    student: {
      githubId: e.student_githubId,
      id: e.student_id,
    },
    task: {
      name: e.task_name,
      id: e.task_id,
    },
    url: e.taskSolution_url,
    score: e.tsr_score,
    total: e.total,
  }))

  setResponse(ctx, OK, {
    content: result,
  });
}
