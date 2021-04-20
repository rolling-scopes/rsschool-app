import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { courseService } from '../../../services';
import { getStudentScore } from '../../../services/course.service';
import { setResponse } from '../../utils';

export const getScoreByStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const students = await getStudentScore(student.id);
  setResponse(ctx, OK, students);
};
