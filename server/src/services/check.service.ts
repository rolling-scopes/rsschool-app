import { getConnection, getRepository } from 'typeorm';
import { CourseTask, Student, Task, TaskSolutionResult, User } from '../models';

const ERROR_RATE = 0.95;
const MIN_LENGTH_MESSAGE = 100;

/* Get checkers who passed max score for everyone and maybe didn't review task*/
export async function getCheckersWithMaxScore(taskId: number) {
  const query = getConnection()
    .createQueryBuilder()
    .select('ts."checkerId"')
    .addSelect('t.name', 'taskName')
    .addSelect('"cu"."githubId"', 'checkerGithubId')
    .from(qb => {
      return qb
        .subQuery()
        .from(TaskSolutionResult, 'tsr')
        .where(qb => {
          const subQuery = qb
            .subQuery()
            .select('ts."studentId"')
            .from(TaskSolutionResult, 'ts')
            .innerJoin(CourseTask, 'ct', 'ct.id = ts."courseTaskId"')
            .groupBy('ts."studentId"')
            .addGroupBy('ct."maxScore"')
            .having(`AVG(ts.score) < ct."maxScore" * ${ERROR_RATE}`)
            .getQuery();
          return `tsr."studentId" IN ${subQuery}`;
        });
    }, 'ts')
    .innerJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
    .innerJoin(Task, 't', 'ct."taskId" = t.id')
    .innerJoin(Student, 'checker', 'ts."checkerId" = checker.id ')
    .innerJoin(User, 'cu', 'checker."userId" = "cu".id')
    .groupBy('ts."checkerId"')
    .addGroupBy('t.name')
    .addGroupBy('"cu"."githubId"')
    .addGroupBy('ct."maxScore"')
    .addGroupBy('ts."courseTaskId"')
    .having('AVG(score) = ct."maxScore"')
    .andHaving('ts."courseTaskId" = :taskId', { taskId })
    .getRawMany();

  return query;
}

/* Get checkers who passed not max score with short comment */
export function getCheckersWithoutComments(taskId: number) {
  const query = getRepository(TaskSolutionResult)
    .createQueryBuilder('ts')
    .select('ts."checkerId"')
    .innerJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
    .where(`LENGTH(ts.comment) < ${MIN_LENGTH_MESSAGE}`)
    .andWhere('ts.score < ct."maxScore"')
    .andWhere('ts."courseTaskId" = :taskId', { taskId })
    .groupBy('ts."checkerId"')
    .getRawMany();

  return query;
}
