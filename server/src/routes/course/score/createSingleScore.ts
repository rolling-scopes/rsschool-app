import Router from '@koa/router';
import { AxiosError } from 'axios';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseRole, IUserSession, TaskResult } from '../../../models';
import { courseService, notificationService, taskResultsService, taskService } from '../../../services';
import { ScoreService } from '../../../services/score';
import { setResponse } from '../../utils';

type ScoreInput = {
  score: number | string;
  comment?: string;
  githubPrUrl?: string;
};

export const createSingleScore = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, courseTaskId, githubId } = ctx.params;
  const { coursesRoles } = ctx.state!.user as IUserSession;

  const inputData: ScoreInput = ctx.request.body;

  const scoreService = new ScoreService(courseId);

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
    if (!coursesRoles?.[courseId]?.includes(CourseRole.JuryActivist)) {
      setResponse(ctx, BAD_REQUEST, { message: 'not jury activist' });
      return;
    }
    if (!data.score) {
      setResponse(ctx, BAD_REQUEST, { message: 'no score' });
      return;
    }

    const current = await taskResultsService.getTaskResult(student.id, courseTask.id);
    if (current == null) {
      const taskResult = taskResultsService.createJuryTaskResult(authorId, {
        ...data,
        studentId: student.id,
        courseTaskId: courseTask.id,
      });
      const addResult = await getRepository(TaskResult).save(taskResult);
      setResponse(ctx, OK, addResult);
      return;
    }

    const existingJuryScore = current.juryScores.find(score => score.authorId === authorId);
    if (existingJuryScore) {
      existingJuryScore.score = data.score;
    } else {
      current.juryScores.push({
        authorId,
        score: data.score,
        dateTime: Date.now(),
        comment: data.comment || '',
      });
    }
    current.score = Math.round(
      current.juryScores.reduce((acc, record) => acc + record.score, 0) / current.juryScores.length,
    );
    const updateResult = await getRepository(TaskResult).save(current);
    setResponse(ctx, OK, updateResult);
    return;
  }

  const mentor = await courseService.getMentorByUserId(courseId, authorId);
  const session = ctx.state.user as IUserSession;

  const isNotTaskOwner = !session.coursesRoles?.[courseId]?.includes(CourseRole.TaskOwner);
  if (
    mentor == null &&
    !session.isAdmin &&
    !session.coursesRoles?.[courseId]?.includes(CourseRole.Manager) &&
    isNotTaskOwner
  ) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid submitter' });
    return;
  }

  const result = scoreService.saveScore(student.id, courseTask.id, { ...data, authorId });
  setResponse(ctx, OK, result);

  try {
    await notificationService.sendNotification({
      userId: student.userId,
      notificationId: 'taskGrade',
      data: {
        courseTask,
        score: data.score,
        comment: data.comment,
      },
    });
  } catch (e) {
    logger.error(`Failed to publish notification ${(e as AxiosError).message}`);
  }
};
