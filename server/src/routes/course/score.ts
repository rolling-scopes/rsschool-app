import { BAD_REQUEST, OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import NodeCache from 'node-cache';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseTask, Student, Task, TaskResult, IUserSession } from '../../models';
import { courseService, OperationResult, taskResultsService, taskService, notificationService } from '../../services';
import { getCourseTasks, getStudentsScore, getStudentScore } from '../../services/course.service';

import { setCsvResponse, setResponse } from '../utils';

type ScoreInput = {
  score: number | string;
  comment?: string;
  githubPrUrl?: string;
};

type ScoresInput = {
  studentGithubId: string;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl?: string;
  mentorGithubId?: string;
};

const memoryCache = new NodeCache({ stdTTL: 120, checkperiod: 150 });

export const postScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, courseTaskId, githubId } = ctx.params;
  const { coursesRoles } = ctx.state!.user as IUserSession;

  const inputData: ScoreInput = ctx.request.body;

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (Number.isNaN(Number(inputData.score))) {
    setResponse(ctx, BAD_REQUEST, 'no score');
    return;
  }
  const data = {
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    githubPrUrl: inputData.githubPrUrl,
  };
  logger.info(data);

  const authorId = ctx.state.user.id;
  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  if (courseTask.checker === 'jury') {
    if (!coursesRoles?.[courseId]?.includes('juryActivist')) {
      setResponse(ctx, BAD_REQUEST, { message: 'not jury activist' });
      return;
    }
    if (!data.score) {
      setResponse(ctx, BAD_REQUEST, { message: 'no score' });
      return;
    }
    const existingResult = await taskResultsService.getTaskResult(student.id, courseTask.id);
    if (existingResult == null) {
      const taskResult = taskResultsService.createJuryTaskResult(authorId, {
        ...data,
        studentId: student.id,
        courseTaskId: courseTask.id,
      });
      const addResult = await getRepository(TaskResult).save(taskResult);
      setResponse(ctx, OK, addResult);
      return;
    }

    const existingJuryScore = existingResult.juryScores.find(score => score.authorId === authorId);
    if (existingJuryScore) {
      existingJuryScore.score = data.score;
    } else {
      existingResult.juryScores.push({
        authorId,
        score: data.score,
        dateTime: Date.now(),
        comment: data.comment || '',
      });
    }
    existingResult.score = Math.round(
      existingResult.juryScores.reduce((acc, record) => acc + record.score, 0) / existingResult.juryScores.length,
    );
    const updateResult = await getRepository(TaskResult).save(existingResult);
    setResponse(ctx, OK, updateResult);
    return;
  }

  const mentor = await courseService.getMentorByUserId(courseId, authorId);
  const session = ctx.state.user as IUserSession;

  const isNotTaskOwner = !session.coursesRoles?.[courseId]?.includes('taskOwner');
  if (mentor == null && !session.isAdmin && !session.coursesRoles?.[courseId]?.includes('manager') && isNotTaskOwner) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid submitter' });
    return;
  }

  const result = taskResultsService.saveScore(student.id, courseTask.id, { ...data, authorId });
  setResponse(ctx, OK, result);
  const taskResultText = await notificationService.renderTaskResultText(courseTask, data.score);
  await notificationService.sendNotification([githubId], taskResultText);
};

export const postMultipleScores = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const courseTaskId: number = ctx.params.courseTaskId;

  const inputData: ScoresInput[] = ctx.request.body;
  const result: OperationResult[] = [];

  for await (const item of inputData) {
    try {
      logger.info(item.studentGithubId);

      const data = {
        studentGithubId: item.studentGithubId,
        courseTaskId,
        score: Math.round(Number(item.score)),
        comment: item.comment || '',
        githubPrUrl: item.githubPrUrl || '',
      };

      const { studentGithubId } = data;

      const student = await getRepository(Student)
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.user', 'user')
        .where('"user"."githubId" = :studentGithubId AND "student"."courseId" = :courseId', {
          studentGithubId,
          courseId,
        })
        .getOne();

      if (student == null) {
        result.push({ status: 'skipped', value: `no student: ${studentGithubId}` });
        continue;
      }

      const existingResult = await taskResultsService.getTaskResult(student.id, data.courseTaskId);
      const user = ctx.state.user as IUserSession | null;
      const authorId = user?.id ?? 0;

      if (existingResult == null) {
        const taskResult = taskResultsService.createTaskResult(authorId, {
          ...data,
          studentId: Number(student.id),
        });
        const addResult = await getRepository(TaskResult).save(taskResult);
        result.push({ status: 'created', value: addResult.id });
        continue;
      }

      if (data.githubPrUrl) {
        existingResult.githubPrUrl = item.githubPrUrl || '';
      }
      if (data.comment) {
        existingResult.comment = item.comment;
      }
      if (data.score !== existingResult.score) {
        existingResult.historicalScores.push({
          authorId,
          score: data.score,
          dateTime: Date.now(),
          comment: item.comment,
        });
        existingResult.score = data.score;
      }

      const updateResult = await getRepository(TaskResult).save(existingResult);
      result.push({ status: 'updated', value: updateResult.id });
    } catch (e) {
      result.push({ status: 'failed', value: e.message });
    }
  }

  setResponse(ctx, OK, result);
};

export const getScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const pagination = {
    current: ctx.state.pageable.current,
    pageSize: ctx.state.pageable.pageSize,
  };
  const filter = {
    ...ctx.query,
    activeOnly: ctx.query.activeOnly === 'true',
  };

  const cacheKey = `${courseId}_score_${JSON.stringify({ pagination, filter })}`;
  const cachedData = memoryCache.get(cacheKey);
  if (cachedData) {
    logger.info(`[Cache]: Score for ${courseId}`);
    setResponse(ctx, OK, cachedData, 120);
    return;
  }

  const students = await getStudentsScore(courseId, pagination, filter);
  memoryCache.set(cacheKey, students);
  setResponse(ctx, OK, students, 120);
};

export const getScoreByStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const students = await getStudentScore(student.id);
  setResponse(ctx, OK, students);
};

export const getScoreAsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = ctx.params.courseId;
  const students = await getStudentsScore(courseId);
  const courseTasks = await getCourseTasks(courseId);

  const result = students.content.map(student => {
    return {
      githubId: student.githubId,
      name: student.name,
      locationName: student.cityName,
      countryName: student.countryName || 'Other',
      mentorGithubId: student.mentor ? (student.mentor as any).githubId : '',
      totalScore: student.totalScore,
      isActive: student.isActive,
      ...getTasksResults(student.taskResults, courseTasks),
    };
  });
  const csv = await parseAsync(result);
  setCsvResponse(ctx, OK, csv, 'score');
};

function getTasksResults(taskResults: { courseTaskId: number; score: number }[], courseTasks: CourseTask[]) {
  return courseTasks.reduce((acc, courseTask) => {
    const r = taskResults.find(r => r.courseTaskId === courseTask.id);
    acc[(courseTask.task as Task).name] = r ? r.score : 0;
    return acc;
  }, {} as Record<string, number>);
  return {};
}
