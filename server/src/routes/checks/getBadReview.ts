import { Student } from './../../models/student';
import { User } from './../../models/user';
import { CourseTask } from './../../models/courseTask';
import { TaskSolutionResult } from './../../models/taskSolutionResult';
import { getRepository } from 'typeorm';
import { OK } from 'http-status-codes';
import { RouterContext } from '../guards';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';

export const getBadReview = (_: ILogger) => async (ctx: RouterContext) => {
  const { taskId } = ctx.params;

  const query = await getRepository(TaskSolutionResult)
    .createQueryBuilder('ts')
    .select('ts."checkerId"')
    .addSelect('ts.score')
    .addSelect('su.githubId')
    .innerJoin(CourseTask, 'ct', 'ct.id = ts."courseTaskId"')
    .innerJoin(Student, 's', 's.id = ts."studentId"')
    .innerJoin(Student, 'ch', 'ch.id = ts."checkerId"')
    .innerJoin(User, 'su', 'su.id = s."userId"')
    .innerJoin(User, 'chu', 'chu.id = ch."userId"')
    .groupBy('ts."checkerId"')
    .addGroupBy('ct."maxScore"')
    .addGroupBy('ts."courseTaskId"')
    .having('AVG(ts.score) = ct."maxScore"')
    .andHaving('ts."courseTaskId" = :taskId', { taskId })
    .getRawMany();

  setResponse(ctx, OK, query);
};
