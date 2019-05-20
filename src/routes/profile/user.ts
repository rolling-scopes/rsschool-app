import * as Router from 'koa-router';
import { getRepository } from 'typeorm';
import { User, Mentor, Student } from '../../models';

import { NOT_FOUND, OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';

export const getProfile = (logger: ILogger) => async (ctx: Router.RouterContext) => {
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
            'students.taskResults',
        ],
    });

  if (profile === undefined) {
            setResponse(ctx, NOT_FOUND);
            return;
        }

  const { students, mentors } = profile;

  if (students) {
        const studentsMentor = await Promise.all(
            students
                .filter(s => !!s.mentor)
                .map(s => getRepository(Mentor)
                    .findOne({ where: { id: s.mentor.id }, relations: ['user'] })));

        profile.students = students
        .filter(s => !!s.mentor)
        .map(st => ({
            ...st,
            mentor: studentsMentor.find((m: any) => m.id === st.mentor.id),
        })) as Student[];
    }

  if (mentors) {
        const mentorForStudentIds = await Promise.all(
            mentors.map(m => getRepository(Mentor).findOne({ where: { id: m.id }, relations: ['students'] }),
        ));

        const mentorForStudents = await Promise.all(mentorForStudentIds.map((m: any) => {
                // tslint:disable-next-line:max-line-length
                return m.students.map((s: any) => getRepository(Student).findOne({ where: { id: s.id }, relations: ['user'] }));
            }).reduce((acc, v) => acc.concat(v), []));

        // tslint:disable-next-line:max-line-length
        const mfS = mentorForStudentIds.map((m: any) => ({...m, students: m.students.map((st: any) => mentorForStudents.find((s: any) => st.id === s.id)) }));

        profile.mentors = mentors.map(m => ({
            ...m,
            ...mfS.find((st: any) => st.id === m.id),
        })) as unknown as Mentor[];
    }

  logger.info(profile);

  setResponse(ctx, OK, profile);
};
