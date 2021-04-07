import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { NOT_FOUND, OK, CREATED, CONFLICT } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import {
  CV,
  IUserSession,
  User,
  Feedback,
  Student,
  Certificate,
  Mentor,
  CourseTask,
  Task,
  Course,
  TaskResult,
  TaskInterviewResult,
} from '../../models';
import { getFullName } from '../../rules';

const getPublicFeedbackFull = async (ownerId: string) => {
  return (
    await getRepository(Feedback)
      .createQueryBuilder('feedback')
      .select('"feedback"."updatedDate" AS "feedbackDate"')
      .addSelect('"feedback"."badgeId" AS "badgeId"')
      .addSelect('"feedback"."comment" AS "comment"')
      .addSelect('"feedback"."heroesUrl" AS "heroesUri"')
      .addSelect('"fromUser"."firstName" AS "fromUserFirstName", "fromUser"."lastName" AS "fromUserLastName"')
      .addSelect('"fromUser"."githubId" AS "fromUserGithubId"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .leftJoin(User, 'fromUser', '"fromUser"."id" = "feedback"."fromUserId"')
      .where('"user"."githubId" = :ownerId', { ownerId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getRawMany()
  ).map(
    ({ feedbackDate, badgeId, comment, heroesUri, fromUserFirstName, fromUserLastName, fromUserGithubId }: any) => ({
      feedbackDate,
      badgeId,
      comment,
      heroesUri,
      fromUser: {
        name: getFullName(fromUserFirstName, fromUserLastName, fromUserGithubId),
        githubId: fromUserGithubId,
      },
    }),
  );
};

const getPublicFeedbackShortened = async (ownerId: string) => {
  return (
    await getRepository(Feedback)
      .createQueryBuilder('feedback')
      .select('"feedback"."updatedDate" AS "feedbackDate"')
      .addSelect('"feedback"."comment" AS "comment"')
      .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
      .where('"user"."githubId" = :ownerId', { ownerId })
      .orderBy('"feedback"."updatedDate"', 'DESC')
      .getRawMany()
  ).map(({ feedbackDate, comment, heroesUri }: any) => ({
    feedbackDate,
    comment,
    heroesUri,
  }));
};

const getStudentsStats = async (ownerId: string) => {
  const query = await getRepository(Student)
    .createQueryBuilder('student')
    .select('"course"."id" AS "courseId"')
    .addSelect('"course"."name" AS "courseName"')
    .addSelect('"course"."locationName" AS "locationName"')
    .addSelect('"course"."fullName" AS "courseFullName"')
    .addSelect('"student"."isExpelled" AS "isExpelled"')
    .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
    .addSelect('"student"."totalScore" AS "totalScore"')
    .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
    .addSelect('"userMentor"."lastName" AS "mentorLastName"')
    .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
    .addSelect('"certificate"."publicId" AS "certificateId"')
    .addSelect('ARRAY_AGG ("courseTask"."maxScore") AS "taskMaxScores"')
    .addSelect('ARRAY_AGG ("courseTask"."scoreWeight") AS "taskScoreWeights"')
    .addSelect('ARRAY_AGG ("task"."name") AS "taskNames"')
    .addSelect('ARRAY_AGG ("task"."descriptionUrl") AS "taskDescriptionUris"')
    .addSelect('ARRAY_AGG ("taskResult"."githubPrUrl") AS "taskGithubPrUris"');

  query
    .addSelect('ARRAY_AGG (COALESCE("taskResult"."score", "taskInterview"."score")) AS "taskScores"')
    .addSelect('ARRAY_AGG ("taskResult"."comment") AS "taskComments"');

  query
    .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
    .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
    .leftJoin(Course, 'course', '"course"."id" = "student"."courseId"')
    .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
    .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
    .leftJoin(CourseTask, 'courseTask', '"courseTask"."courseId" = "student"."courseId"')
    .leftJoin(Task, 'task', '"courseTask"."taskId" = "task"."id"')
    .leftJoin(
      TaskResult,
      'taskResult',
      '"taskResult"."studentId" = "student"."id" AND "taskResult"."courseTaskId" = "courseTask"."id"',
    )
    .leftJoin(
      TaskInterviewResult,
      'taskInterview',
      '"taskInterview"."studentId" = "student"."id" AND "taskInterview"."courseTaskId" = "courseTask"."id"',
    );

  query
    .where('"user"."githubId" = :ownerId', { ownerId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .groupBy('"course"."id", "student"."id", "userMentor"."id", "certificate"."publicId"')
    .orderBy('"course"."endDate"', 'DESC');

  const rawStats = await query.getRawMany();

  const studentStats = rawStats.map(
    ({
      courseId,
      courseName,
      locationName,
      courseFullName,
      isExpelled,
      expellingReason,
      isCourseCompleted,
      totalScore,
      mentorFirstName,
      mentorLastName,
      mentorGithubId,
      taskMaxScores,
      taskScoreWeights,
      taskNames,
      taskDescriptionUris,
      taskGithubPrUris,
      taskScores,
      taskComments,
      certificateId,
    }: any) => {
      const tasks = taskMaxScores.map((maxScore: number, idx: number) => ({
        maxScore,
        scoreWeight: taskScoreWeights[idx],
        name: taskNames[idx],
        descriptionUri: taskDescriptionUris[idx],
        githubPrUri: taskGithubPrUris[idx],
        score: taskScores[idx],
        comment: taskComments[idx],
      }));

      return {
        courseId,
        courseName,
        locationName,
        courseFullName,
        isExpelled,
        expellingReason,
        isCourseCompleted,
        totalScore,
        tasks,
        certificateId,
        position: null,
        mentor: {
          githubId: mentorGithubId,
          name: getFullName(mentorFirstName, mentorLastName, mentorGithubId),
        },
      };
    },
  );

  const studentPositions = await Promise.all(
    studentStats.map(async ({ totalScore, courseId }: { totalScore: number; courseId: number }) => {
      const rawPositions = await getRepository(Student)
        .createQueryBuilder('student')
        .select('"student"."courseId" AS "courseId"')
        .addSelect('COUNT(*) AS "position"')
        .where('"student"."courseId" = :courseId', { courseId })
        .andWhere('"student"."totalScore" >= :totalScore', { totalScore })
        .groupBy('"student"."courseId"')
        .getRawMany();
      return rawPositions.map(({ courseId, position }) => ({ courseId, position: Number(position) }))[0];
    }),
  );

  return studentStats.map((stats, idx) => ({ ...stats, ...studentPositions[idx] }));
};

export const getOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.query;

  const user = await getRepository(User).findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, user.opportunitiesConsent);
};

export const setOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.request.body;

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const { opportunitiesConsent: reqConsent } = ctx.request.body;
  const prevConsent = user.opportunitiesConsent;

  if (reqConsent === prevConsent) {
    setResponse(ctx, OK, user.opportunitiesConsent);
    return;
  }

  const userWithEmptyOpportunities = {
    ...user,
    opportunitiesConsent: reqConsent,
  };

  const result = await userRepository.save({ ...user, ...userWithEmptyOpportunities });

  setResponse(ctx, OK, result.opportunitiesConsent);
};

const getJobSeekersData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const currentTimestamp = new Date().getTime();

  let cvProfiles = await getRepository(CV)
    .createQueryBuilder('cv')
    .select(
      'cv.name, cv.ownerId, cv.desiredPosition, cv.englishLevel, cv.fullTime, cv.location, cv.startFrom, cv.expires',
    )
    .leftJoin(User, 'user', 'cv.ownerId = user.githubId')
    .where('user.opportunitiesConsent = true')
    .andWhere('cv.expires >= :currentTimestamp', { currentTimestamp })
    .getRawMany();

  if (cvProfiles.length) {
    cvProfiles = await Promise.all(
      cvProfiles.map(async (cv: any) => {
        const { ownerId } = cv;

        const feedback = await getPublicFeedbackFull(ownerId);

        const courses = await getStudentsStats(ownerId);

        return {
          ...cv,
          feedback,
          courses,
        };
      }),
    );
  }

  setResponse(ctx, OK, cvProfiles);
};

const saveCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: ownerId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { ownerId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const data = ctx.request.body;

  const result = await cvRepository.save({
    ...cv,
    ...data,
  });

  setResponse(ctx, OK, result);
};

export const createCV = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: ownerId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);

  const cv = await cvRepository.findOne({ where: { ownerId } });

  if (cv != undefined) {
    setResponse(ctx, CONFLICT);
    return;
  }

  const data = ctx.request.body;

  const newCV = await cvRepository.create({
    ownerId,
    ...data,
  });

  await cvRepository.save(newCV);

  setResponse(ctx, CREATED, newCV);
};

export const getCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: ownerId } = ctx.query;

  const cvRepository = getRepository(CV);

  const cv = await cvRepository.findOne({ where: { ownerId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const feedback = await getPublicFeedbackShortened(ownerId);
  const courses = await getStudentsStats(ownerId);

  const { id, ownerId: omittedOwnerId, ...cvData } = cv;

  const res = {
    ...cvData,
    feedback,
    courses,
  };

  setResponse(ctx, OK, res);
};

export const extendCV = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId: ownerId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { ownerId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const EXPIRATION_DAYS_PROLONGATION = 14;

  const now = new Date();
  now.setDate(now.getDate() + EXPIRATION_DAYS_PROLONGATION);
  const timestamp = now.getTime();
  const result = await cvRepository.save({ ...cv, expires: timestamp });

  setResponse(ctx, OK, Number(result.expires));
};

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/opportunities' });

  router.post('/extend', guard, extendCV(logger));
  router.get('/consent', guard, getOpportunitiesConsent(logger));
  router.post('/consent', guard, setOpportunitiesConsent(logger));
  router.get('/', guard, getJobSeekersData(logger));
  router.get('/cv', guard, getCVData(logger));
  router.put('/cv', guard, createCV(logger));
  router.post('/', guard, saveCVData(logger));

  return router;
}
