import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { StageInterview, Mentor, Student, IUserSession } from '../../models';
import { setResponse } from '../utils';
import { getMentorsWithStudents, getStudents } from '../../services/courseService';
import {
  createStageInterviewPairs,
  getStageInterviewsPairs,
  getInterviewsByGithubId,
} from '../../services/stageInterviews';
import countries from '../../services/reference-data/countries.json';
import cities from '../../services/reference-data/cities.json';
import _ from 'lodash';

const citiesMap = _.mapValues(_.keyBy(cities, 'name'), 'parentId');
const countriesMap = _.mapValues(_.keyBy(countries, 'id'), 'name');

export const getStageInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  // const userId = ctx.state!.user.id;
  // const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);
  const result = await getStageInterviewsPairs(stageId);
  setResponse(ctx, OK, result);
};

type PostInput = {
  mentorGithubId: string;
  studentGithubId: string;
};

export const postStageInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: PostInput[] = Array.isArray(ctx.request.body) ? ctx.request.body : [ctx.request.body];
  const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);

  try {
    const result = [];
    for await (const item of data) {
      const [mentor, student] = await Promise.all([
        getRepository(Mentor)
          .createQueryBuilder('mentor')
          .innerJoin('mentor.user', 'user')
          .where('user.githubId = :githubId', { githubId: item.mentorGithubId })
          .getOne(),
        getRepository(Student)
          .createQueryBuilder('student')
          .innerJoin('student.user', 'user')
          .where('user.githubId = :githubId', { githubId: item.studentGithubId })
          .getOne(),
      ]);
      result.push(
        await getRepository(StageInterview).save({
          mentorId: mentor!.id,
          studentId: student!.id,
          courseId,
          stageId,
        }),
      );
    }
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

const shortTrackStudents = [
  'katyyats',
  'spaceearth',
  'alphajax',
  'iliyapunko',
  'lighthousekeeperyn',
  'caninax',
  'elaray1',
  'vitbazylchik',
  'ieopvl',
  'kseniakuntsevich',
  'msv1990',
  'trigsen',
  'yalatan',
  'kalinatimka',
  'viktarrudzenia',
  'moiseenokv',
  'maliaxandr',
  'alekseyvanyukevich',
  'achuyanov',
  'msv1990',
  'mitskevichvs',
  'gurbanovali',
  'caninax',
  'vitbazylchik',
  'achuyanov',
  'viktorguschin',
  'serezhishe',
  'trigsen',
  'romanrg',
  'spinagrblzzz',
  'vitbazylchik',
  'vladislavbizin',
  'eugenesheuchuk',
  'wonderxuy',
  'pyatromarchanka',
  'timary13',
  'pyatromarchanka',
  'fursaleksey',
];

export const postStageInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);

  try {
    const [mentors, students, interviewPairs] = await Promise.all([
      getMentorsWithStudents(courseId),
      getStudents(courseId, true),
      getStageInterviewsPairs(stageId),
    ]);

    let mentorsWithCapacity = mentors
      .map(m => {
        const scheduledInterviewsCount = interviewPairs.filter(pair => pair.mentor.githubId === m.githubId).length;
        const capacity = m.maxStudentsLimit - m.students.length - scheduledInterviewsCount;
        return {
          ...m,
          countryName: countriesMap[citiesMap[m.locationName || 'Other']] || 'Other',
          capacity: capacity > 1 ? capacity + 2 : capacity === 1 ? capacity + 1 : 0,
        };
      })
      .filter(m => m.capacity > 0);

    const reservedMentors = getReservedMentors(mentorsWithCapacity, 'Minsk');
    mentorsWithCapacity = mentorsWithCapacity.filter(m => !reservedMentors.includes(m.githubId));

    const alreadyHasInterview = interviewPairs.map(pair => pair.student.githubId);
    const freeStudents = students
      .filter(
        st => !shortTrackStudents.includes(st.githubId) && !st.mentor && !alreadyHasInterview.includes(st.githubId),
      )
      .map(s => ({
        ...s,
        countryName: countriesMap[citiesMap[s.locationName || 'Other']] || 'Other',
      }));

    const result = createStageInterviewPairs(mentorsWithCapacity, freeStudents, 10);

    const items = result
      .map(pair => ({ mentorId: pair.mentor.id, studentId: pair.student.id, courseId, stageId }))
      .concat(
        mentors
          .filter(m => m.students.length > 0)
          .reduce(
            (acc, m) =>
              acc.concat(
                (m.students as any[]).map((s: any) => ({ mentorId: m.id, studentId: s.id, courseId, stageId })),
              ),
            [] as any[],
          ),
      );

    await getRepository(StageInterview).save(items), setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getStudentInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const githubId = (ctx.state!.user as IUserSession).githubId;

  const records = await getInterviewsByGithubId(courseId, githubId);
  setResponse(ctx, OK, records);
};

function getReservedMentors(mentors: any[], locationName: string) {
  const minskMentors = mentors.filter(m => m.locationName === locationName).reverse();
  let reservedCapacity = 0;
  const reservedMentors: string[] = [];
  for (const mentor of minskMentors) {
    reservedCapacity = reservedCapacity + mentor.capacity;
    reservedMentors.push(mentor.githubId);
    if (reservedCapacity >= 20) {
      break;
    }
  }
  return reservedMentors;
}
