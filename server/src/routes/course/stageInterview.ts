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
  getAvailableStudentsForStageInterview,
} from '../../services/stageInterviews';
import countries from '../../services/reference-data/countries.json';
import cities from '../../services/reference-data/cities.json';
import _ from 'lodash';
import { StageInterviewFeedback } from './../../models/stageInterviewFeedback';

const citiesMap = _.mapValues(_.keyBy(cities, 'name'), 'parentId');
const countriesMap = _.mapValues(_.keyBy(countries, 'id'), 'name');

export const getStageInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
  mentorGithubId?: string;
  studentGithubId?: string;
  githubId?: string;
};

export const postStageInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const inputData: PostInput[] = Array.isArray(ctx.request.body) ? ctx.request.body : [ctx.request.body];
  const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);

  try {
    const result = [];
    const data = prepareInputData(inputData, ctx.state!.user);

    for await (const item of data) {
      const [mentor, student] = await getStundentAndMentor(courseId, item.mentorGithubId, item.studentGithubId);
      if (mentor == null || student == null) {
        continue;
      }

      const repository = getRepository(StageInterview);
      const existingInterview = await repository.findOne({
        where: { studentId: student.id, stageId, isCompleted: false },
      });

      if (existingInterview) {
        existingInterview.mentorId = mentor.id;
        const interview = await repository.save(existingInterview);
        result.push(interview);
      } else {
        const interview = await repository.save({ mentorId: mentor.id, studentId: student.id, courseId, stageId });
        result.push(interview);
      }
    }
    setResponse(ctx, OK, result);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

export const deleteStageInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const interviewId: number = Number(ctx.params.interviewId);
  try {
    const interview = await getRepository(StageInterview).delete(interviewId);
    setResponse(ctx, OK, interview);
  } catch (e) {
    setResponse(ctx, BAD_REQUEST, { message: e.message });
  }
};

function prepareInputData(
  input: {
    githubId?: string;
    mentorGithubId?: string;
    studentGithubId?: string;
  }[],
  user?: IUserSession,
) {
  const hasUser = user && !!user.githubId;
  return input.map(d =>
    hasUser
      ? {
          studentGithubId: d.githubId!,
          mentorGithubId: user!.githubId,
        }
      : {
          studentGithubId: d.studentGithubId!,
          mentorGithubId: d.mentorGithubId!,
        },
  );
}

async function getStundentAndMentor(courseId: number, mentorGithubId: string, studentGithubId: string) {
  return Promise.all([
    getRepository(Mentor)
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .where('user.githubId = :githubId AND mentor.courseId = :courseId', {
        githubId: mentorGithubId,
        courseId,
      })
      .getOne(),
    getRepository(Student)
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.githubId = :githubId AND student.courseId = :courseId', {
        githubId: studentGithubId,
        courseId,
      })
      .getOne(),
  ]);
}

const shortTrackStudents = [
  'albertkengerli',
  'alphajax',
  'antonionick',
  'dsv-sergey',
  'ieopvl',
  'kalinatimka',
  'katyyats',
  'magerrrr',
  'maliaxandr',
  'nastyamedv',
  'nikola2390',
  'pyatromarchanka',
  'romanrg',
  'serezhishe',
  'sk1ngr0s',
  'skodasha',
  'spaceearth',
  'spinagrblzzz',
  'timary13',
  'viktarrudzenia',
  'viktorguschin',
  'vitbazylchik',
  'vladislavbizin',
  'wonderxuy',
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

export const getAvailableStudentsForInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = Number(ctx.params.courseId);
  const stageId: number = Number(ctx.params.id);
  let result = await getAvailableStudentsForStageInterview(courseId, stageId);
  result = result.filter(r => !shortTrackStudents.includes(r.githubId));
  setResponse(ctx, OK, result);
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
        `Stage interview for userId='${userId}' and studentId='${studentId}' is not found at stage='${stageId}'`,
      );
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

    if (data.decision === 'yes') {
      await getRepository(Student).update(studentId, { mentorId: stageInterview.mentorId });
    } else if (data.decision === 'no' && !data.isGoodCandidate && data.isGoodCandidate !== null) {
      await getRepository(Student).update(studentId, {
        isExpelled: true,
        expellingReason: '',
        endDate: new Date(),
      });
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
