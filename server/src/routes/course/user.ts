import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../utils';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { userService, courseService } from '../../services';
import { CourseUser } from '../../models';
import { RouterContext } from '../guards';

interface Roles {
  isManager: boolean;
  isJuryActivist: boolean;
  isSupervisor: boolean;
}
interface User extends Roles {
  userId: number;
}

export const putUsers = (_?: ILogger) => async (ctx: RouterContext) => {
  const { courseId } = ctx.params;
  const body: User[] = ctx.request.body;

  const allUsers = body.map(user => ({ ...user, courseId }));
  const foundUsers = await getRepository(CourseUser)
    .createQueryBuilder('user')
    .where({ courseId })
    .andWhere('"userId" = ANY(:users)', { users: allUsers.map(user => user.userId) })
    .getMany();

  const usersToInsert = allUsers.filter(user => !foundUsers.find(({ userId }) => user.userId === userId));
  const usersToUpdate = allUsers.filter(user => foundUsers.find(({ userId }) => user.userId === userId));

  if (usersToInsert.length) {
    await getRepository(CourseUser).insert(usersToInsert);
  }

  if (usersToUpdate.length) {
    await Promise.all(
      usersToUpdate.map(({ userId, isJuryActivist, isManager, isSupervisor }) =>
        getRepository(CourseUser).update({ userId }, { isJuryActivist, isManager, isSupervisor }),
      ),
    );
  }

  setResponse(ctx, OK);
};

export const getUsers = (_?: ILogger) => async (ctx: RouterContext) => {
  const { courseId } = ctx.params;
  const data = await courseService.getUsers(courseId);
  if (data == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  setResponse(ctx, OK, data);
};

export const putUser = (_?: ILogger) => async (ctx: RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const user = await userService.getUserByGithubId(githubId);
  if (user == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const { isJuryActivist = false, isManager = false, isSupervisor = false }: Roles = ctx.request.body;
  const existing = await getRepository(CourseUser).findOne({ where: { courseId, userId: user.id } });
  if (existing == null) {
    await getRepository(CourseUser).insert({ courseId, userId: user.id, isJuryActivist, isManager, isSupervisor });
  } else {
    await getRepository(CourseUser).update(existing.id, { isJuryActivist, isManager, isSupervisor });
  }

  setResponse(ctx, OK);
};
