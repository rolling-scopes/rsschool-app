import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { Mentor, User } from '../../models';

import { OK, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { studentsService } from '../../services';

export const getMentorContacts = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const userId = ctx.state!.user.id;
  const courseId: number = ctx.params.courseId;

  const student = await studentsService.getCourseStudent(courseId, userId);

  if (student == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const profiles = await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .leftJoin('mentor.students', 'students')
    .leftJoin('task_checker', 'taskChecker', '"taskChecker"."mentorId" = "mentor"."id"')
    .where(
      'mentor."courseId" = :courseId AND ("taskChecker"."studentId" = :studentId OR students."userId" = :userId)',
      {
        studentId: student.id,
        userId,
        courseId,
      },
    )
    .getMany();

  if (profiles == null) {
    setResponse(ctx, OK, []);
    return;
  }

  setResponse(
    ctx,
    OK,
    profiles.map(profile => ({
      githubId: (profile.user as User).githubId,
      contacts: [(profile.user as User).contactsEmail, (profile.user as User).contactsPhone],
    })),
  );
};
