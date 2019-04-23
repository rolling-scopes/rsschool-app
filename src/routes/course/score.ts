import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { TaskResult, Mentor, Student } from '../../models';
import { ILogger } from '../../logger';

type ScoreInput = {
  studentId: number;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl: string;
};

export const postScore = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const data: ScoreInput = ctx.request.body;

  if (!data.githubPrUrl) {
    setResponse(ctx, BAD_REQUEST, { message: 'no pull request' });
    return;
  }

  if (data.githubPrUrl.startsWith('https://github.com')) {
    if (!data.githubPrUrl.includes('/pull/')) {
      setResponse(ctx, BAD_REQUEST, { message: 'incorrect pull request link' });
      return;
    }
  }

  const id = ctx.state!.user.id;
  const mentor = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .where('mentor.courseId = :courseId', { courseId })
    .innerJoinAndSelect('mentor.user', 'user', 'user.id = :id', {
      id,
    })
    .getOne();

  if (mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'no mentor' });
    return;
  }

  const student = await getRepository(Student).findOne(data.studentId, { relations: ['mentor'] });

  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'no student' });
    return;
  }
  if (student.mentor.id !== mentor.id) {
    setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
    return;
  }

  const taskResult = {
    courseTask: data.courseTaskId,
    student: data.studentId,
    score: data.score,
    githubPrUrl: data.githubPrUrl,
  } as TaskResult;

  const result = await getRepository(TaskResult).save(taskResult);

  setResponse(ctx, OK, result);
};
