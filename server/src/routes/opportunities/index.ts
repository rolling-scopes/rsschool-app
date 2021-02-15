import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { NOT_FOUND, OK, CREATED, CONFLICT } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import { User, IUserSession } from '../../models';
import { getStudentStats } from '../profile/student-stats';
import { getPublicFeedback } from '../profile/public-feedback';
import { Permissions } from '../profile/permissions';

const saveCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;
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
    name,
    notes,
    phone,
    email,
    skype,
    telegram,
    linkedin,
    location,
    github,
    website
  } = ctx.request.body;

  const result = await userRepository.save({
    ...user,
    cvSelfIntroLink: selfIntroLink,
    cvStartFrom: startFrom,
    cvFullTime: fullTime,
    cvMilitaryService: militaryService,
    cvAvatarLink: avatarLink,
    cvEnglishLevel: englishLevel,
    cvDesiredPosition: desiredPosition,
    cvName: name,
    cvNotes: notes,
    cvPhone: phone,
    cvEmail: email,
    cvSkype: skype,
    cvTelegram: telegram,
    cvLinkedin: linkedin,
    cvLocation: location,
    cvGithub: github,
    cvWebsite: website
  });

  setResponse(ctx, OK, result);
};

const getJobSeekersData = (_: ILogger) => async (ctx: Router.RouterContext) => {

  const users = await getRepository(User)
    .find({ where: { opportunitiesConsent: true } })

  let CVProfiles = users.map(item => {
    const { cvName, githubId, cvDesiredPosition, cvEnglishLevel, cvFullTime, cvLocation, cvStartFrom } = item;
    return {
      name: cvName,
      githubId,
      desiredPosition: cvDesiredPosition,
      englishLevel: cvEnglishLevel,
      fullTime: cvFullTime,
      location: cvLocation,
      startFrom: cvStartFrom
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
  const { githubId } = ctx.query;

  const userRepository = getRepository(User);
  const profile = await userRepository.findOne({ where: { githubId } });

  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const {
    cvName: name,
    cvDesiredPosition: desiredPosition,
    cvAvatarLink: avatarLink,
    cvEnglishLevel: englishLevel,
    cvMilitaryService: militaryService,
    cvEnglishLevel: selfIntroLink,
    cvFullTime: fullTime,
    cvStartFrom: startFrom,
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

  const courses = await getStudentStats(githubId, { isCoreJsFeedbackVisible: false } as Permissions);
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
    courses,
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
    cvSelfIntroLink: null,
    fullTime: false,
    cvStartFrom: null,
    cvLink: null,
    cvMilitaryService: null,
    cvAvatarLink: null,
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

  router.get('/cv', guard, getCVData(logger));
  router.post('/', guard, saveCVData(logger));


  router.get('/consent/', guard, getOpportunitiesConsent(logger));
  router.post('/consent/:githubId', guard, setOpportunitiesConsent(logger));

  return router;
}
