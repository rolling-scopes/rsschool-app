export * from './logging';

import Router from '@koa/router';

import { errorHandlerMiddleware } from './logging';
import { publicMeRouter } from './me';
import { courseRoute, courseCrudRoute } from './course';
import { coursesRoute } from './courses';
import { discordServerRoute } from './discordServer';
import { userGroupRoute } from './userGroup';
import { authRoute } from './auth';
import { usersRoute } from './users';
import { taskRoute } from './task';
import { filesRoute } from './file';
import { taskResultRoute } from './taskResult';
import { studentRoute } from './student';
import { tasksRoute } from './tasks';
import { taskVerification } from './taskVerification';
import { profileRoute } from './profile';
import { registryRouter } from './registry';
import { sessionRoute } from './session';
import { activityRoute } from './activity';
import { feedbackRoute } from './feedback';
import { certificateRoute } from './certificate';
import { lectureRoute } from './event';
import { lecturesRoute } from './events';
import { jwtRoute } from './jwt';
import { userRoute } from './user';
import { consentRoute } from './consent';
import { repositoryRoute } from './repository';
import { opportunitiesRoute } from './opportunities';
import { interviewQuestionRoute } from './interviewQuestion';

import { ILogger } from '../logger';
import { userRolesMiddleware, courseMiddleware } from './middlewares';
import { interviewQuestionCategoryRoute } from './interviewQuestionCategory';
import { checksRoute } from './checks';

type RoutesMiddleware = (logger: ILogger) => { publicRouter: Router };

function applyRouter(topRouter: Router, router: Router) {
  topRouter.use(router.routes());
  topRouter.use(router.allowedMethods());
}

export const routesMiddleware: RoutesMiddleware = (logger: ILogger) => {
  const router = new Router<any, any>();

  router.use(errorHandlerMiddleware(logger));
  router.use(userRolesMiddleware, courseMiddleware);

  // public routes
  applyRouter(router, certificateRoute(logger));
  applyRouter(router, authRoute());

  applyRouter(router, sessionRoute(logger));
  applyRouter(router, publicMeRouter(logger));
  applyRouter(router, registryRouter(logger));
  applyRouter(router, courseRoute(logger));
  applyRouter(router, courseCrudRoute(logger));
  applyRouter(router, coursesRoute(logger));
  applyRouter(router, discordServerRoute(logger));
  applyRouter(router, userGroupRoute(logger));
  applyRouter(router, usersRoute(logger));
  applyRouter(router, taskRoute(logger));
  applyRouter(router, taskResultRoute(logger));
  applyRouter(router, studentRoute(logger));
  applyRouter(router, tasksRoute(logger));
  applyRouter(router, taskVerification(logger));
  applyRouter(router, profileRoute(logger));
  applyRouter(router, activityRoute(logger));
  applyRouter(router, feedbackRoute(logger));
  applyRouter(router, interviewQuestionRoute(logger));
  applyRouter(router, interviewQuestionCategoryRoute(logger));
  applyRouter(router, checksRoute(logger));
  applyRouter(router, filesRoute(logger));

  applyRouter(router, lectureRoute(logger));
  applyRouter(router, lecturesRoute(logger));
  applyRouter(router, jwtRoute(logger));
  applyRouter(router, userRoute(logger));
  applyRouter(router, consentRoute(logger));
  applyRouter(router, repositoryRoute(logger));
  applyRouter(router, opportunitiesRoute(logger));

  return { publicRouter: router };
};
