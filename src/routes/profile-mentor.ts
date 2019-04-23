import * as Router from 'koa-router';
import { NOT_FOUND, OK } from 'http-status-codes';
import { Mentor, User } from '../models';
import { ILogger } from '../logger';
import { getRepository, FindOneOptions } from 'typeorm';
import { setResponse } from './utils';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
};

export function publicProfileMentorRouter(_: ILogger) {
  const router = new Router({ prefix: '/v2/course/:courseId/profile/mentor' });

  router.get('/', async (ctx: Router.RouterContext) => {
    const id = ctx.state!.user.id;
    const courseId = Number(ctx.params.courseId);

    const mentor = await getRepository(Mentor)
      .createQueryBuilder('mentor')
      .where('mentor."courseId" = :courseId', { courseId })
      .innerJoinAndSelect('mentor.user', 'user')
      .where('mentor.user.id = :id', { id })
      .getOne();

    if (mentor === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }
    const mentorId = mentor.id as number | undefined;
    const mentorEntity = await getRepository(Mentor).findOne(mentorId, {
      relations: ['students', 'students.user'],
    } as FindOneOptions);

    if (mentorEntity == null || mentorEntity.students == null) {
      setResponse(ctx, NOT_FOUND);
      return;
    }

    const mentorResponse = {
      students: mentorEntity.students.map<StudentDTO>(student => ({
        studentId: student.id,
        firstName: (student.user as User).firstName,
        lastName: (student.user as User).lastName,
        githubId: (student.user as User).githubId,
      })),
    };

    setResponse(ctx, OK, mentorResponse);
  });

  return router;
}
