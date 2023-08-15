import Router from '@koa/router';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { adminGuard, anyCourseManagerGuard, guard, RouterContext } from '../guards';
import { OperationResult, userService } from '../../services';

const postUsers = (_: ILogger) => async (ctx: RouterContext) => {
  const data = ctx.request.body as { githubId: string }[];

  const result: OperationResult[] = [];
  for await (const item of data) {
    try {
      const userRepository = getRepository(User);
      const entity = await userRepository.findOne({ where: { githubId: item.githubId.toLowerCase() } });

      if (entity == null) {
        const user = await userRepository.save(item);
        result.push({ status: 'created', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
      } else {
        const user = await userRepository.save({ ...entity, ...item });
        result.push({ status: 'updated', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
      }
    } catch (e) {
      result.push({ status: 'failed', value: `GithubId: ${item.githubId}. Error: ${(e as Error).message}` });
    }
  }

  setResponse(ctx, OK, result);
};

type SearchConfigItem = {
  field: string;
  isCaseSensitive: boolean;
};

const isSearchConfigIncludesName = (searchConfig: SearchConfigItem[]): boolean => {
  return ['firstName', 'lastName'].every(fieldName => searchConfig.find(({ field }) => field === fieldName));
};

const generateSearchString = (searchConfig: SearchConfigItem[], parameterName: string): string => {
  const searchStringParts = searchConfig.map(
    ({ field, isCaseSensitive }: SearchConfigItem) =>
      `user.${field} ${isCaseSensitive ? 'like' : 'ilike'} ${parameterName}`,
  );

  if (isSearchConfigIncludesName(searchConfig)) {
    searchStringParts.push(`CONCAT(user.firstName, ' ', user.lastName) ilike ${parameterName}`);
  }

  return searchStringParts.join(' OR ');
};

const generateResponse = (user: any, searchConfig: SearchConfigItem[]) =>
  searchConfig.reduce((response: any, { field }: SearchConfigItem) => ({ ...response, [field]: user[field] }), {});

const getSearch = (_: ILogger) => (searchConfig: SearchConfigItem[]) => async (ctx: RouterContext) => {
  const searchText = ctx.params.searchText;
  if (!searchText) {
    setResponse(ctx, OK, []);
    return;
  }

  const entities = await getRepository(User)
    .createQueryBuilder('user')
    .where(generateSearchString(searchConfig, ':text'), {
      text: searchText.toLowerCase() + '%',
    })
    .orWhere(`CAST(user.discord AS jsonb)->>'username' ILIKE :search`, { search: `${searchText}%` })
    .limit(20)
    .getMany();

  setResponse(
    ctx,
    OK,
    entities.map(user => {
      const response = generateResponse(user, searchConfig);
      const { lastName, firstName, ...other } = response;
      return {
        ...other,
        id: user.id,
        name: userService.createName({ lastName, firstName }),
        discord: user.discord ? `${user.discord.username}#${user.discord.discriminator}` : undefined,
      };
    }),
  );
};

const getSearchByGithubId = (logger: ILogger) =>
  getSearch(logger)([
    { field: 'githubId', isCaseSensitive: true },
    { field: 'firstName', isCaseSensitive: false },
    { field: 'lastName', isCaseSensitive: false },
  ]);

const postUserActivist = (_: ILogger) => async (ctx: RouterContext) => {
  const data = ctx.request.body as { activist: boolean };
  const userId: number = ctx.params.userId;
  const user = await userService.getUserById(userId);
  if (user == null) {
    setResponse(ctx, BAD_REQUEST, 'no user');
    return;
  }
  user.activist = !!data.activist;
  await userService.saveUser(user);
  setResponse(ctx, OK);
};

export function usersRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/users' });

  /**
   * @swagger
   *
   * /users:
   *   post:
   *      description: Add/Update users
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.post('/', adminGuard, postUsers(logger));

  /**
   * @swagger
   *
   * /users:
   *   post:
   *      description: Update user activist status
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.post('/{userId}/activist', adminGuard, postUserActivist(logger));

  /**
   * @swagger
   *
   * /users/search/:searchText:
   *   post:
   *      description: Search users
   *      security:
   *        - cookieAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: operation status
   */
  router.get('/search/:searchText', guard, getSearchByGithubId(logger));

  const searchConfig = [
    { field: 'githubId', isCaseSensitive: true },
    { field: 'contactsTelegram', isCaseSensitive: true },
    { field: 'contactsSkype', isCaseSensitive: true },
    { field: 'contactsEpamEmail', isCaseSensitive: true },
    { field: 'primaryEmail', isCaseSensitive: true },
    { field: 'firstName', isCaseSensitive: false },
    { field: 'lastName', isCaseSensitive: false },
  ];

  router.get('/search/extended/:searchText', anyCourseManagerGuard, getSearch(logger)(searchConfig));

  return router;
}
