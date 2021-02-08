import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { NOT_FOUND, OK, CREATED, CONFLICT } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import { User, IUserSession } from '../../models';
import { validateGithubId } from '../validators';
import { getStudentStats } from '../profile/student-stats';
import { getPublicFeedback } from '../profile/public-feedback';
import { Permissions } from '../profile/permissions';

const saveCVIData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.params;
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });
  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const {
    selfIntroLink,
    startFrom,
    fullTime,
    militaryService,
    avatarLink,
    englishLevel,
    desiredPosition,
    cvName,
    cvNotes,
    cvPhone,
    cvEmail,
    cvSkype,
    cvTelegram,
    cvLinkedin,
    cvLocation,
    cvGithub,
    cvWebsite
  } = ctx.request.body;

  const result = await userRepository.save({
    ...user,
    selfIntroLink,
    startFrom,
    fullTime,
    militaryService,
    avatarLink,
    englishLevel,
    desiredPosition,
    cvName,
    cvNotes,
    cvPhone,
    cvEmail,
    cvSkype,
    cvTelegram,
    cvLinkedin,
    cvLocation,
    cvGithub,
    cvWebsite
  });
  setResponse(ctx, OK, result);
};

const getJobSeekersData = (_: ILogger) => async (ctx: Router.RouterContext) => {

  const users = await getRepository(User)
    .find({ where: { opportunitiesConsent: true } })

  let CVProfiles = users.map(item => {
    const { cvName, githubId, desiredPosition, englishLevel, fullTime, cvLocation, startFrom } = item;
    return {
      cvName,
      githubId,
      desiredPosition,
      englishLevel,
      fullTime,
      cvLocation,
      startFrom
    };
  });

  if (CVProfiles.length) {
    CVProfiles = await Promise.all(CVProfiles.map(async (profile: any) => {
      const { githubId } = profile;
      const feedback = await getPublicFeedback(githubId);
      const courses = await getStudentStats(githubId, { isCoreJsFeedbackVisible: false } as Permissions);
      console.log(courses);
      return {
        ...profile,
        feedback,
        courses
      };
    }));
  }

  setResponse(ctx, OK, CVProfiles);
};

export const getCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const userRepository = getRepository(User);
  const profile = await userRepository.findOne({ where: { githubId } });

  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const {
    cvName: name,
    desiredPosition,
    avatarLink,
    englishLevel,
    militaryService,
    selfIntroLink,
    fullTime,
    startFrom,
    cvPhone: phone,
    cvEmail: email,
    cvSkype: skype,
    cvTelegram: telegram,
    cvLinkedin: linkedin,
    cvLocation: location,
    cvGithub: github,
    cvWebsite: website,
    cvNotes: notes
  } = profile;

  const studentStats = await getStudentStats(githubId, { isCoreJsFeedbackVisible: false } as Permissions);
  const publicFeedback = await getPublicFeedback(githubId);

  const CVData = {
    selfIntroLink,
    startFrom,
    fullTime,
    militaryService,
    avatarLink,
    desiredPosition,
    englishLevel,
    name,
    notes,
    phone,
    email,
    skype,
    telegram,
    linkedin,
    location,
    github,
    website,
    courses: studentStats,
    publicFeedback
  };

  setResponse(ctx, OK, CVData);

};

export const setOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const userRepository = getRepository(User);
  const profile = await userRepository.findOne({ where: { githubId } });
  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const { opportunitiesConsent: reqConsent } = ctx.request.body;
  const prevConsent = profile.opportunitiesConsent;

  if (reqConsent === prevConsent) {
    setResponse(ctx, OK, profile.opportunitiesConsent);
    return;
  }

  const emptyOpportunitiesInfo = {
    selfIntroLink: null,
    fullTime: false,
    startFrom: null,
    cvLink: null,
    militaryService: null,
    avatarLink: null,
    cvName: null,
    cvNotes: null,
    cvPhone: null,
    cvEmail: null,
    cvSkype: null,
    cvTelegram: null,
    cvLinkedin: null,
    cvLocation: null,
    cvGithub: null,
    cvWebsite: null
  };

  const userWithEmptyOpportunities = {
    ...profile,
    ...emptyOpportunitiesInfo,
    opportunitiesConsent: reqConsent
  };

  const result = await userRepository.save({ ...profile, ...userWithEmptyOpportunities });
  setResponse(ctx, OK, result.opportunitiesConsent);

};

export const getOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const profile = await getRepository(User).findOne({ where: { githubId } });
  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, profile.opportunitiesConsent);
};

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/opportunities' });

  router.get('/', guard, getJobSeekersData(logger));

  router.get('/:githubId', guard, getCVData(logger));
  router.post('/:githubId', guard, validateGithubId, saveCVIData(logger));


  router.get('/consent/:githubId', guard, getOpportunitiesConsent(logger));
  router.post('/consent/:githubId', guard, setOpportunitiesConsent(logger));

  return router;
}
