import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { IUserSession, Student } from '../../../models';
import { StageInterviewRepository } from '../../../repositories/stageInterview';
import { StageInterviewFeedbackRepository } from '../../../repositories/stageInterviewFeedback';
import { courseService } from '../../../services';
import { setResponse } from '../../utils';

type BodyParams = {
  githubId: string;
  json: string;
  isCompleted: boolean;
  decision: string | null;
  isGoodCandidate: boolean | null;
};

export const createFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const data: BodyParams = ctx.request.body;
  const { courseId } = ctx.params;

  const user = ctx.state!.user as IUserSession;
  const githubId = data.githubId;

  try {
    const repository = getCustomRepository(StageInterviewRepository);
    const interviews = await repository.findByStudent(courseId, githubId);
    const interview = interviews.find(it => it.interviewer.githubId === user.githubId);

    if (interview == null) {
      throw new Error(`Stage Interview for interviewer='${user.githubId}' and student='${githubId}' is not found'`);
    }

    const feedbackRepository = getCustomRepository(StageInterviewFeedbackRepository);
    await feedbackRepository.create(interview.id, data);

    const [student, mentor] = await Promise.all([
      courseService.queryStudentByGithubId(courseId, githubId),
      courseService.queryMentorByGithubId(courseId, user.githubId),
    ]);

    if (data.decision === 'yes' && student && mentor) {
      await getRepository(Student).update(student?.id, { mentorId: mentor.id });
    }

    setResponse(ctx, StatusCodes.OK, { stageInterviewId: interview.id, ...data });
  } catch (e) {
    setResponse(ctx, StatusCodes.BAD_REQUEST, { message: e.message });
  }
};
