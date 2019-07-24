import * as Router from 'koa-router';
import { OK, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Mentor, User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { OperationResult, userService } from '../../services';

type MentorDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  mentorId: number;
};

export const getMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const mentors = await getRepository(Mentor).find({ where: { courseId }, relations: ['user'] });

  const students = mentors.map<MentorDTO>(mentor => ({
    mentorId: mentor.id,
    firstName: (mentor.user as User).firstName,
    lastName: (mentor.user as User).lastName,
    githubId: (mentor.user as User).githubId,
  }));

  setResponse(ctx, OK, students);
};

export const postMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: { githubId: string; maxStudentsLimit: number }[] = ctx.request.body;
  const mentorRepository = getRepository(Mentor);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];
  for await (const item of data) {
    const { githubId, maxStudentsLimit } = item;

    console.time(githubId);

    const user = await userService.getUserByGithubId(item.githubId);

    if (user == null) {
      result.push({
        status: 'skipped',
        value: githubId,
      });
      continue;
    }

    const exists =
      (await getRepository(Mentor)
        .createQueryBuilder('mentor')
        .innerJoinAndSelect('mentor.user', 'user')
        .innerJoinAndSelect('mentor.course', 'course')
        .where('user.id = :userId AND course.id = :courseId', {
          userId: user.id,
          courseId,
        })
        .getCount()) > 0;

    if (exists) {
      result.push({
        status: 'skipped',
        value: item.githubId,
      });
      continue;
    }

    const mentor: Partial<Mentor> = { user, maxStudentsLimit, courseId };
    const savedMentor = await mentorRepository.save(mentor);

    result.push({
      status: 'created',
      value: savedMentor.id,
    });

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, result);
};
