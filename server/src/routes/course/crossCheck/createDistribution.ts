import Router from '@koa/router';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';
import { ILogger } from '../../../logger';
import { TaskSolutionChecker } from '../../../models';
import { CrossCheckDistributionService } from '../../../services/distribution';
import { courseService, taskService } from '../../../services';
import { setResponse } from '../../utils';

const crossCheckDistributionService = new CrossCheckDistributionService();

export const createDistribution = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, StatusCodes.BAD_REQUEST);
    return;
  }

  const solutions = await courseService.getTaskSolutionsWithoutChecker(courseTaskId);
  const solutionsMap = new Map<number, number>();
  for (const solution of solutions) {
    solutionsMap.set(solution.studentId, solution.id);
  }

  const students = Array.from(solutionsMap.keys());

  if (students.length === 0) {
    setResponse(ctx, StatusCodes.OK, { crossCheckPairs: [] });
    return;
  }

  const pairs = crossCheckDistributionService.distribute(students, courseTask.pairsCount ?? undefined);
  const crossCheckPairs = pairs
    .filter(pair => solutionsMap.has(pair.studentId))
    .map(pair => ({
      ...pair,
      courseTaskId,
      taskSolutionId: solutionsMap.get(pair.studentId),
    }));

  await getRepository(TaskSolutionChecker).save(crossCheckPairs);
  setResponse(ctx, StatusCodes.OK, { crossCheckPairs });
};
