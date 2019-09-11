import Router from 'koa-router';
import { OK } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Course, IUserSession } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { guard } from '../guards';

const getCourses = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { isAdmin, isHirer, roles } = ctx.state!.user as IUserSession;
  const courses = (await getRepository(Course).find({})).filter(course => {
    const isCourseManager = roles[course.id] === 'coursemanager';
    const isParticipant = !!roles[course.id];
    return isAdmin || isHirer || isCourseManager || (isParticipant && course.completed === false) || course.planned;
  });

  setResponse(ctx, OK, courses);
};

export function coursesRoute(logger: ILogger) {
  const router = new Router({ prefix: '/courses' });

  /**
   * @swagger
   *
   * /courses:
   *   get:
   *      description: Gets courses info
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          description: Courses info
   */
  router.get('/', guard, getCourses(logger));

  return router;
}
