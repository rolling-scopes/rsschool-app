import Router from '@koa/router';
import { DateTime } from 'luxon';
import { omit } from 'lodash';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { StatusCodes } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import { CV, User, Feedback, Student, Certificate, Mentor, Course } from '../../models';
import {} from '../../models';
import { getFullName } from '../../rules';

const { NOT_FOUND, OK, INTERNAL_SERVER_ERROR, CONFLICT } = StatusCodes;

enum RESULTS {
  EXISTS = 'ALREADY_EXISTS',
  CREATED = 'CREATED',
}

const { EXISTS, CREATED } = RESULTS;

const getFeedbackCV = async (githubId: string) => {
  return await getRepository(Feedback)
    .createQueryBuilder('feedback')
    .select('"feedback"."updatedDate" AS "feedbackDate"')
    .addSelect('"feedback"."comment" AS "comment"')
    .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .orderBy('"feedback"."updatedDate"', 'DESC')
    .getRawMany();
};

const getFeedbackJobSeeker = async (githubId: string) => {
  return await getRepository(Feedback)
    .createQueryBuilder('feedback')
    .select('"feedback"."badgeId" AS "badgeId"')
    .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .orderBy('"feedback"."updatedDate"', 'DESC')
    .getRawMany();
};

const getStudentsStats = async (githubId: string) => {
  const query = await getRepository(Student)
    .createQueryBuilder('student')
    .addSelect('"course"."id" AS "courseId"')
    .addSelect('"course"."name" AS "courseName"')
    .addSelect('"course"."locationName" AS "locationName"')
    .addSelect('"course"."fullName" AS "courseFullName"')
    .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
    .addSelect('"student"."totalScore" AS "totalScore"')
    .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
    .addSelect('"userMentor"."lastName" AS "mentorLastName"')
    .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
    .addSelect('"certificate"."publicId" AS "certificateId"');

  query
    .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
    .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
    .leftJoin(Course, 'course', '"course"."id" = "student"."courseId"')
    .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
    .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"');

  query
    .where('"user"."githubId" = :githubId', { githubId })
    .andWhere('"student"."isExpelled" != :expelled', { expelled: true })
    .groupBy('"course"."id", "student"."id", "userMentor"."id", "certificate"."publicId"')
    .orderBy('"course"."endDate"', 'DESC');

  const rawStats = await query.getRawMany();

  const studentStats = rawStats.map(
    ({
      courseId,
      courseName,
      locationName,
      courseFullName,
      isCourseCompleted,
      totalScore,
      mentorFirstName,
      mentorLastName,
      mentorGithubId,
      certificateId,
    }: any) => {
      return {
        courseId,
        courseName,
        locationName,
        courseFullName,
        isCourseCompleted,
        totalScore,
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
      return rawPositions.map(({ position }) => ({ position: Number(position) }))[0];
    }),
  );

  return studentStats.map((stats, idx) => ({ ...omit(stats, ['courseId']), ...studentPositions[idx] }));
};

const giveOpportunitiesConsent = async (ctx: Router.RouterContext, githubId: string) => {
  const userRepository = getRepository(User);

  const creationResult = await createCV(githubId);

  if (creationResult === EXISTS) {
    setResponse(ctx, CONFLICT, { message: 'CV already exists' });
    return;
  }

  if (creationResult === CREATED) {
    const result = await userRepository.update({ githubId }, { opportunitiesConsent: true });
    setResponse(ctx, OK, result.raw.opportunitiesConsent);
    return;
  }

  setResponse(ctx, INTERNAL_SERVER_ERROR, { message: 'CV creation failed' });
};

const withdrawOpportunitiesConsent = async (ctx: Router.RouterContext, githubId: string) => {
  await deleteCV(githubId);
  const userRepository = getRepository(User);
  const result = await userRepository.update({ githubId }, { opportunitiesConsent: false });
  setResponse(ctx, OK, result.raw.opportunitiesConsent);
};

export const manageOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, opportunitiesConsent: isConsentRecieved } = ctx.request.body;

  const user = await getRepository(User).findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  isConsentRecieved ? await giveOpportunitiesConsent(ctx, githubId) : await withdrawOpportunitiesConsent(ctx, githubId);
};

const getJobSeekersData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const isNeededToGetOnlyVisible = ctx.query?.mod === 'visible';
  const currentTimestamp = new Date().getTime();

  const cvProfilesQuery = getRepository(CV)
    .createQueryBuilder('cv')
    .select(
      'cv.name, cv.githubId, cv.desiredPosition, cv.englishLevel, cv.fullTime, cv.locations, cv.startFrom, cv.expires, cv.isHidden',
    )
    .leftJoin(User, 'user', 'cv.githubId = user.githubId')
    .where('user.opportunitiesConsent = true')
    .andWhere('cv.expires >= :currentTimestamp', { currentTimestamp });

  if (isNeededToGetOnlyVisible) cvProfilesQuery.andWhere('cv.isHidden = false');

  let cvProfiles = await cvProfilesQuery.getRawMany();

  if (cvProfiles.length) {
    cvProfiles = await Promise.all(
      cvProfiles.map(async (cv: CV) => {
        const { githubId } = cv;

        const [feedback, courses] = await Promise.all([getFeedbackJobSeeker(githubId), getStudentsStats(githubId)]);

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
  const { githubId } = ctx.state.user;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const data = ctx.request.body;

  const result = await cvRepository.save({
    ...cv,
    ...data,
  });

  const { id, expires, githubId: omittedGithubId, isHidden, ...dataToSend } = result;

  setResponse(ctx, OK, dataToSend);
};

const getOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.request.query;

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, user.opportunitiesConsent);
};

const createCV = async (githubId: string) => {
  const cvRepository = getRepository(CV);

  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv !== undefined) {
    return EXISTS;
  }

  const newCV = await cvRepository.create({ githubId });
  const savingResult = await cvRepository.save(newCV);
  if (savingResult) return CREATED;
};

export const deleteCV = async (githubId: string) => {
  const cvRepository = getRepository(CV);
  await cvRepository.delete({ githubId });
};

export const getCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, mod } = ctx.query;
  const isFullDataNeeded = mod === 'all';

  const cv = await getRepository(CV)
    .createQueryBuilder('cv')
    .select('"cv"."name" AS "name"')
    .addSelect('"cv"."selfIntroLink" AS "selfIntroLink"')
    .addSelect('"cv"."startFrom" AS "startFrom"')
    .addSelect('"cv"."fullTime" AS "fullTime"')
    .addSelect('"cv"."expires" AS "expires"')
    .addSelect('"cv"."militaryService" AS "militaryService"')
    .addSelect('"cv"."englishLevel" AS "englishLevel"')
    .addSelect('"cv"."avatarLink" AS "avatarLink"')
    .addSelect('"cv"."desiredPosition" AS "desiredPosition"')
    .addSelect('"cv"."notes" AS "notes"')
    .addSelect('"cv"."phone" AS "phone"')
    .addSelect('"cv"."email" AS "email"')
    .addSelect('"cv"."skype" AS "skype"')
    .addSelect('"cv"."telegram" AS "telegram"')
    .addSelect('"cv"."linkedin" AS "linkedin"')
    .addSelect('"cv"."githubUsername" AS "githubUsername"')
    .addSelect('"cv"."website" AS "website"')
    .addSelect('"cv"."locations" AS "locations"')
    .where('"cv"."githubId" = :githubId', { githubId })
    .getRawOne();

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  if (isFullDataNeeded) {
    const [feedback, courses] = await Promise.all([getFeedbackCV(githubId), getStudentsStats(githubId)]);
    const cvWithFeedbackAndCourses = {
      ...cv,
      feedback,
      courses,
    };
    setResponse(ctx, OK, cvWithFeedbackAndCourses);
    return;
  }

  setResponse(ctx, OK, cv);
};

export const extendCV = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state.user;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const EXPIRATION_DAYS_PROLONGATION = 14;

  const expirationTimestamp = DateTime.local().plus({ days: EXPIRATION_DAYS_PROLONGATION }).valueOf();
  const result = await cvRepository.save({ ...cv, expires: expirationTimestamp });

  setResponse(ctx, OK, Number(result.expires));
};

export const manageVisibility = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, isHidden } = ctx.request.body;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result = await cvRepository.update({ githubId }, { isHidden });
  setResponse(ctx, OK, result.raw.isHidden);
};

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/opportunities' });
  router.post('/visibility', guard, manageVisibility(logger));
  router.post('/status', guard, extendCV(logger));
  router.get('/consent', guard, getOpportunitiesConsent(logger));
  router.post('/consent', guard, manageOpportunitiesConsent(logger));
  router.get('/jobseekers', guard, getJobSeekersData(logger));
  router.get('/cv', guard, getCVData(logger));
  router.post('/', guard, saveCVData(logger));

  return router;
}
