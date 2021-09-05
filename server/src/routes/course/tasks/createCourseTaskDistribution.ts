import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { CourseTask, TaskChecker } from '../../../models';
import { MentorRepository } from '../../../repositories/mentor';
import { CrossMentorDistributionService } from '../../../services/distribution';
import { setResponse } from '../../utils';

const crossMentorDistributionService = new CrossMentorDistributionService();

export const createCourseTaskDistribution = (logger: ILogger) => async (ctx: Router.RouterContext) => {
  const courseTaskId = Number(ctx.params.courseTaskId);
  const courseId = Number(ctx.params.courseId);
  const cleanDistribution = ctx.request.body.clean;

  const courseTask = await getRepository(CourseTask).findOne({ where: { id: courseTaskId }, select: ['id'] });

  if (courseTask == null) {
    setResponse(ctx, StatusCodes.NOT_FOUND);
    return;
  }

  const mentorRepository = getCustomRepository(MentorRepository);
  const mentors = await mentorRepository.findActive(courseId, true);

  if (mentors.length === 0) {
    setResponse(ctx, StatusCodes.OK, {});
    return;
  }

  const checkerRepository = getRepository(TaskChecker);

  if (cleanDistribution) {
    await checkerRepository.delete({ courseTaskId });
  }

  const existingPairs = await checkerRepository.find({ courseTaskId });

  const { mentors: crossMentors } = crossMentorDistributionService.distribute(mentors, existingPairs);

  const taskCheckPairs = crossMentors
    .map(stm => stm.students?.map(s => ({ courseTaskId, mentorId: stm.id, studentId: s.id })) ?? [])
    .reduce((acc, student) => acc.concat(student), []);

  await checkerRepository.insert(taskCheckPairs);

  logger.info(`Created [${taskCheckPairs.length}] cross-mentor pairs`);
  setResponse(ctx, StatusCodes.OK, taskCheckPairs);
};
