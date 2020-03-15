import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { courseService, stageInterviewService } from '../../services';
import { setResponse } from '../utils';

export const getStudentInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const interviews = await courseService.getInterviewsByStudent(courseId, githubId);
  const stageInterviews = await stageInterviewService.getStageInterviewsByStudent(courseId, githubId);
  setResponse(ctx, OK, stageInterviews.concat(interviews));
};

export const getCourseInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId } = ctx.params;
  const data = await courseService.getCourseTasks(courseId);

  const result = data
    .filter(interview => {
      const type = interview.type ?? interview.task.type;
      return type === 'stage-interview' || type === 'interview';
    })
    .map(interview => {
      return {
        id: interview.id,
        name: interview.task.name,
        startDate: interview.studentStartDate,
        endDate: interview.studentEndDate,
        descriptionUrl: interview.task.descriptionUrl,
        type: interview.type || interview.task.type,
      };
    });
  setResponse(ctx, OK, result);
};
