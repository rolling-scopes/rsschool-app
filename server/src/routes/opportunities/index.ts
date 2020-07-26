import Router from '@koa/router';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { NOT_FOUND, OK } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import { User } from '../../models';
import { userService } from '../../services';
import { validateGithubId } from '../validators';

const postProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.params;
  const user = await userService.getUserByGithubId(githubId);
  if (user == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const {
    opportunitiesConsent,
    selfIntroLink,
    cvLink,
    educationHistory,
    employmentHistory,
    militaryService,
  } = ctx.request.body;
  const userRepository = getRepository(User);
  const entity = await userRepository.findOne({ where: { githubId } });
  if (!opportunitiesConsent) {
    const nullifiedEntity = {
      ...entity,
      opportunitiesConsent: false,
      selfIntroLink: null,
      cvLink: null,
      educationHistory: [],
      employmentHistory: [],
      militaryService: null,
    };
    const result = await userRepository.save(nullifiedEntity);
    setResponse(ctx, OK, result);
    return;
  }
  const result = await userRepository.save({
    ...entity,
    opportunitiesConsent,
    selfIntroLink,
    cvLink,
    educationHistory,
    employmentHistory,
    militaryService,
  });
  setResponse(ctx, OK, result);
};

const getProfiles = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const users = await getRepository(User)
    .createQueryBuilder('user')
    .select([
      'user.selfIntroLink AS selfIntroLink',
      'user.cvLink AS cvLink',
      'user.educationHistory AS educationHistory',
      'user.employmentHistory AS employmentHistory',
      'user.militaryService AS militaryService',
    ])
    .where('"opportunitiesConsent" = true')
    .execute();
  setResponse(ctx, OK, users);
};

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router({ prefix: '/opportunities' });

  router.post('/:githubId', guard, validateGithubId, postProfile(logger));
  router.get('/', guard, getProfiles(logger));

  return router;
}
