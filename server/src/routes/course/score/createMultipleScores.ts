import Router from '@koa/router';
import { OK } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { IUserSession, Student } from '../../../models';
import { OperationResult } from '../../../services';
import { ScoreService } from '../../../services/score';
import { setResponse } from '../../utils';

type ScoresInput = {
  studentGithubId: string;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl?: string;
  mentorGithubId?: string;
};

export const createMultipleScores = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const courseTaskId: number = ctx.params.courseTaskId;

  const inputData: ScoresInput[] = ctx.request.body;
  const result: OperationResult[] = [];

  const scoreService = new ScoreService(courseId);

  for (const item of inputData) {
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

      const user = ctx.state.user as IUserSession | null;
      const authorId = user?.id ?? 0;

      const [isNew] = await scoreService.saveScore(Number(student.id), Number(courseTaskId), {
        authorId,
        comment: data.comment,
        score: data.score,
        githubPrUrl: data.githubPrUrl,
      });

      if (isNew) {
        result.push({ status: 'created', value: undefined });
      } else {
        result.push({ status: 'updated', value: undefined });
      }
    } catch (e) {
      result.push({ status: 'failed', value: e.message });
    }
  }

  setResponse(ctx, OK, result);
};
