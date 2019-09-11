import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { NOT_FOUND, OK } from 'http-status-codes';
import { setResponse } from '../utils';
import { Student } from '../../models';
import { ILogger } from '../../logger';
import { OperationResult, courseService } from '../../services';

type PairInput = {
  studentGithubId: string;
  mentorGithubId: string;
};

export const postPairs = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: PairInput[] = ctx.request.body;

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];

  for await (const item of data) {
    try {
      const githubId = item.mentorGithubId.toLowerCase();
      const mentor = await courseService.getMentorByGithubId(courseId, githubId);

      if (mentor == null) {
        result.push({
          status: 'skipped',
          value: `Cannot find mentor: ${item.mentorGithubId}`,
        });
        continue;
      }

      const studentRepository = getRepository(Student);
      const student = await studentRepository
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.user', 'user')
        .where('"user"."githubId" = :id AND "student"."courseId" = :courseId', {
          id: item.studentGithubId.toLowerCase(),
          courseId,
        })
        .getOne();

      if (student == null) {
        result.push({
          status: 'skipped',
          value: `Cannot find student: ${item.studentGithubId}`,
        });
        continue;
      }

      await studentRepository.update(student.id, { mentorId: mentor.id });
      result.push({ status: 'updated', value: student.id });
    } catch (e) {
      logger.error(e);

      result.push({
        status: 'failed',
        value: e.message,
      });
    }
  }

  setResponse(ctx, OK, { result });
};
