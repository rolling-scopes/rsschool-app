import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { User, Mentor, Student } from '../../models';

import { NOT_FOUND, OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';

export const getProfile = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  logger.info('Users');

  const query = ctx.query as { githubId: string | undefined };

  if (query === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  if (query.githubId === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const profile = await getRepository(User).findOne({
        where: { githubId: query.githubId.toLowerCase() },
        relations: [
            'mentors',
            'students',
            'mentors.course',
            'students.course',
            'students.mentor',
        ],
    });

  if (profile === undefined) {
            setResponse(ctx, NOT_FOUND);
            return;
        }

  const { students } = profile;

  if (students) {
        const mentors = await Promise.all(
            students.map(s => getRepository(Mentor).findOne({ where: { id: s.mentor.id }, relations: ['user'] }),
        ));

        profile.students = students.map(st => ({
            ...st,
            mentor: mentors.find((m: any) => m.id === st.mentor.id)
        })) as Student[];
    }

  logger.info(profile);

  setResponse(ctx, OK, profile);
};
