import { OK, BAD_REQUEST } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { StageInterview, Mentor, Student, IUserSession } from '../../models';
import { setResponse } from '../utils';
import { getMentorsWithStudents, getStudents } from '../../services/courseService';
import { createInterviewPairs } from '../../rules/interviewPairs';
import {
  getStageInterviewsPairs,
  getInterviewsByGithubId,
  getStageInterviewsByMentorId,
  getStageInterviewStudentFeedback,
} from '../../services/stageInterviews';
import countries from '../../services/reference-data/countries.json';
import cities from '../../services/reference-data/cities.json';
import _ from 'lodash';
import { StageInterviewFeedback } from './../../models/stageInterviewFeedback';

const citiesMap = _.mapValues(_.keyBy(cities, 'name'), 'parentId');
const countriesMap = _.mapValues(_.keyBy(countries, 'id'), 'name');

export const getStageInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  // const userId = ctx.state!.user.id;
  // const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);
  const result = await getStageInterviewsPairs(stageId);
  setResponse(ctx, OK, result);
};

export const getStageInterviewStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const githubId = ctx.state!.user.githubId;
  const stageId: number = Number(ctx.params.id);
  const result = await getStageInterviewsByMentorId(stageId, githubId);
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
          .where('user.githubId = :githubId AND mentor.courseId = :courseId', {
            githubId: item.mentorGithubId,
            courseId,
          })
          .getOne(),
        getRepository(Student)
          .createQueryBuilder('student')
          .innerJoin('student.user', 'user')
          .where('user.githubId = :githubId AND student.courseId = :courseId', {
            githubId: item.studentGithubId,
            courseId,
          })
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
          studentsPreference: m.studentsPreference,
          countryName: countriesMap[citiesMap[m.locationName || 'Other']] || 'Other',
          capacity: capacity > 1 ? capacity + 2 : capacity === 1 ? capacity + 1 : 0,
          students: [],
        };
      })
      .filter(m => m.capacity > 0);

    const reservedMentors = getReservedMentors(mentorsWithCapacity, 'Minsk');
    console.warn({ reservedMentors });

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

    const result = createInterviewPairs(mentorsWithCapacity, freeStudents, 10);
    const items = result
      .map(pair => ({ mentorId: pair.mentorId, studentId: pair.studentId, courseId, stageId }))
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
    await getRepository(StageInterview).save(items);
    setResponse(ctx, OK, items);
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

type InterviewFeedbackPostInput = {
  studentId: number;
  json: string;
  isCompleted: boolean;
  decision: string | null;
  isGoodCandidate: boolean | null;
};

export const postStageInterviewFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: InterviewFeedbackPostInput = ctx.request.body;

  const stageId: number = Number(ctx.params.id);
  const userId: number = (ctx.state!.user as IUserSession).id;
  const studentId = data.studentId;

  try {
    const stageInterview: any = await getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('mentor.user', 'user')
      .where('stageInterview.stageId = :stageId', { stageId })
      .andWhere('stageInterview.studentId = :studentId', { studentId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!stageInterview) {
      throw new Error(
        `Stage interview for userId='${userId}' and studentId='${studentId}' is not found at stage='${stageId}'`);
    }

    const stageInterviewId = stageInterview.id;

    const feedback = await getRepository(StageInterviewFeedback)
      .createQueryBuilder('stageInterviewFeedback')
      .where('stageInterviewFeedback.stageInterviewId = :stageInterviewId', { stageInterviewId })
      .getOne();

    const feedbackRequest = {
      stageInterviewId,
      json: data.json,
    };

    if (feedback) {
      await getRepository(StageInterviewFeedback).save({ id: feedback.id, ...feedbackRequest });
    } else {
      await getRepository(StageInterviewFeedback).save(feedbackRequest);
    }

    const stageInterviewRequest: any = {
      isCompleted: data.isCompleted,
    };

    if (data.decision) {
      stageInterviewRequest.decision = data.decision;
    }

    if (data.isGoodCandidate) {
      stageInterviewRequest.isGoodCandidate = data.isGoodCandidate;
    }

    await getRepository(StageInterview).update(stageInterviewId, stageInterviewRequest);

    if (data.isCompleted) {
      await getRepository(Student).update(studentId, { mentorId: stageInterview.mentorId });
    }

    setResponse(ctx, OK, feedbackRequest);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const getStageInterviewFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const stageId: number = Number(ctx.params.id);
  const userId: number = (ctx.state!.user as IUserSession).id;
  const studentId: number = Number(ctx.params.studentId);

  try {
    const stageInterviewFeedback: any = await getStageInterviewStudentFeedback(stageId, userId, studentId);

    setResponse(ctx, OK, stageInterviewFeedback ? stageInterviewFeedback.json : '{}');
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};
