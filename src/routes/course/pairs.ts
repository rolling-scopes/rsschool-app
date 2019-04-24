import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { Mentor, Student } from '../../models';
import { ILogger } from '../../logger';

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
  const mentorRepository = getRepository(Mentor);
  const studentRepository = getRepository(Student);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: string[] = [];

  for await (const item of data) {
    try {
      const mentor = await mentorRepository
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.user', 'user')
        .where('"user"."githubId" = :id AND "mentor"."courseId" = :courseId', {
          id: item.mentorGithubId,
          courseId,
        })
        .getOne();

      // if (mentor) {
      //   result.push(mentor);
      //   continue;
      // }
      if (mentor == null) {
        result.push(`Cannot find mentor: ${item.mentorGithubId}`);
        continue;
      }

      const student = await studentRepository
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.user', 'user')
        .where('"user"."githubId" = :id AND "student"."courseId" = :courseId', {
          id: item.studentGithubId,
          courseId,
        })
        .getOne();

      if (student == null) {
        result.push(`Cannot find student: ${item.studentGithubId}`);
        continue;
      }

      student.mentor = mentor;
      studentRepository.save(student);
      result.push('ok');
    } catch (e) {
      logger.error(e);
      result.push(e.message);
    }
  }

  setResponse(ctx, OK, { result });
};
