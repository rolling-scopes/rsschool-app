import { OK } from 'http-status-codes';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import { InterviewRepository } from '../../repositories/interview';
import { StageInterviewRepository } from '../../repositories/stageInterview';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getStudentInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const interviewRepository = getCustomRepository(InterviewRepository);
  const stageInterviewRepository = getCustomRepository(StageInterviewRepository);
  const [interviews, stageInterviews] = await Promise.all([
    interviewRepository.findByStudent(courseId, githubId),
    stageInterviewRepository.findByStudent(courseId, githubId),
  ]);
  const result = stageInterviews.concat(interviews);

  setResponse(ctx, OK, result);
};

export const getMentorInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const interviewRepository = getCustomRepository(InterviewRepository);
  const stageInterviewRepository = getCustomRepository(StageInterviewRepository);
  const [interviews, stageInterviews] = await Promise.all([
    interviewRepository.findByInterviewer(courseId, githubId),
    stageInterviewRepository.findByInterviewer(courseId, githubId),
  ]);
  const result = stageInterviews.concat(interviews);
  setResponse(ctx, OK, result);
};

export const getInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
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
