import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Mentor, Student } from '../../models';
import { ILogger } from '../../logger';
import { OperationResult } from '../../services';

type PairInput = {
  studentGithubId: string;
  mentorGithubId: string;
};

export const postPairs = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const data: PairInput[] = ctx.request.body;

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];

  for await (const item of data) {
    try {
      const mentor = await getRepository(Mentor)
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.user', 'user')
        .where('"user"."githubId" = :id AND "mentor"."courseId" = :courseId', {
          id: item.mentorGithubId,
          courseId,
        })
        .getOne();

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
          id: item.studentGithubId,
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

      student.mentor = mentor;
      const savedStudent = await studentRepository.save(student);
      result.push({
        status: 'updated',
        value: savedStudent.id,
      });
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
