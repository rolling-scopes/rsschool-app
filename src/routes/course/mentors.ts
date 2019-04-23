import * as Router from 'koa-router';
import { OK, BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Mentor, User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

type MentorDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  mentorId: number;
};

export const getMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

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
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const data: { githubId: string; maxStudentsLimit: number }[] = ctx.request.body;

  const userRepository = getRepository(User);
  const mentorRepository = getRepository(Mentor);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  for await (const item of data) {
    console.time(item.githubId);

    const user = await userRepository.findOne({ where: { githubId: item.githubId } });
    if (user == null) {
      continue;
    }

    const exists = (await mentorRepository.count({ where: { user } })) > 0;
    if (exists) {
      continue;
    }

    const mentor = {
      user,
      course: courseId,
      maxStudentsLimit: item.maxStudentsLimit,
    };
    await mentorRepository.save(mentor);

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, data);
};
