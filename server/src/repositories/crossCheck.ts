import { EntityRepository, AbstractRepository, getRepository } from 'typeorm';
import { TaskSolution, TaskSolutionResult } from '../models';

@EntityRepository(TaskSolution)
export class CrossCheckRepository extends AbstractRepository<TaskSolution> {
  public async findReviewResult(
    courseTaskId: number,
    studentId: number,
    checkerId: number,
  ): Promise<TaskSolutionResult | undefined> {
    const item = await getRepository(TaskSolutionResult)
      .createQueryBuilder('result')
      .where('result."studentId" = :studentId', { studentId })
      .andWhere('result."checkerId" = :checkerId', { checkerId })
      .andWhere('result."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
    return item;
  }

  public async findSolution(courseTaskId: number, studentId: number): Promise<TaskSolution | undefined> {
    const item = await getRepository(TaskSolution)
      .createQueryBuilder('solution')
      .where('solution."studentId" = :studentId', { studentId })
      .andWhere('solution."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
    return item;
  }
}
