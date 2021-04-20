import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseRole, IUserSession, TaskResult } from '../../../models';
import { courseService, notificationService, taskResultsService, taskService } from '../../../services';
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
    if (!coursesRoles?.[courseId]?.includes(CourseRole.juryActivist)) {
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

  const isNotTaskOwner = !session.coursesRoles?.[courseId]?.includes(CourseRole.taskOwner);
  if (
    mentor == null &&
    !session.isAdmin &&
    !session.coursesRoles?.[courseId]?.includes(CourseRole.manager) &&
    isNotTaskOwner
  ) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid submitter' });
    return;
  }

  const result = taskResultsService.saveScore(student.id, courseTask.id, { ...data, authorId });
  setResponse(ctx, OK, result);
  const taskResultText = await notificationService.renderTaskResultText(courseTask, data.score, data.comment);
  await notificationService.sendNotification([githubId], taskResultText);
};
