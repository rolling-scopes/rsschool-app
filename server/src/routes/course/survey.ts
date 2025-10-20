import { getRepository, getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseLeaveSurveyResponse } from '../../models';
import { StudentRepository } from '../../repositories/student.repository';

const SELF_EXPELLED_MARK = 'Self expelled from the course';

export function submitLeaveSurvey(logger: ILogger) {
  return async (ctx: any) => {
    const surveyRepository = getRepository(CourseLeaveSurveyResponse);
    const studentRepository = getCustomRepository(StudentRepository);
    const { reasonForLeaving, otherComments } = ctx.request.body;
    const { courseId } = ctx.params;
    const { id: userId, githubId } = ctx.state.user;

    logger.info(`Submitting leave survey for user ${userId} in course ${courseId}`);

    try {
      const newSurveyResponse = surveyRepository.create({
        userId,
        courseId,
        reasonForLeaving,
        otherComments,
      });

      await surveyRepository.save(newSurveyResponse);

      const comment = `${SELF_EXPELLED_MARK}. Reason: ${reasonForLeaving?.join(', ') || 'N/A'}. Comment: ${otherComments || 'N/A'}`;
      await studentRepository.expel(courseId, githubId, comment);

      ctx.status = 201;
      ctx.body = { message: 'Survey submitted and student expelled successfully' };
    } catch (error) {
      logger.error('Failed to submit leave survey or expel student', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}