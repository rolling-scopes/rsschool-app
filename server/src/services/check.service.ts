import { getRepository } from 'typeorm';
import { CourseTask, Student, Task, TaskSolutionResult, User } from '../models';

const LOW_ERROR_RATE = 0.9;
const HIGH_ERROR_RATE = 1.1;
const TASK_REVIEW_COUNT = 4;
const MIN_LENGTH_MESSAGE = 70;

/* Get checkers who passed max score for everyone and maybe didn't review task*/
export async function getCheckersWithMaxScore(taskId: number) {
  const data = await getRepository(TaskSolutionResult)
    .createQueryBuilder('ts')
    .select('t.name', 'taskName')
    .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
    .addSelect('"studentUser"."githubId"', 'studentGithubId')
    .addSelect('"studentAvg"."avg"', 'studentAvgScore')
    .addSelect('ts.score', 'checkerScore')
    .innerJoin(
      qb =>
        qb
          .subQuery()
          .select('tsr."studentId"')
          .addSelect('AVG(tsr.score)', 'avg')
          .from(TaskSolutionResult, 'tsr')
          .where('tsr."courseTaskId" = :taskId', { taskId })
          .groupBy('tsr."studentId"'),
      'studentAvg',
      'ts."studentId" = "studentAvg"."studentId"',
    )
    .innerJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
    .innerJoin(Task, 't', 'ct."taskId" = t.id')
    .innerJoin(Student, 'checker', 'ts."checkerId" = checker.id ')
    .innerJoin(User, 'checkerUser', 'checker."userId" = "checkerUser".id')
    .innerJoin(Student, 'student', 'ts."studentId" = student.id ')
    .innerJoin(User, 'studentUser', 'student."userId" = "studentUser".id')
    .where(qb => {
      const subQuery = qb
        .subQuery()
        .select('ts."checkerId"')
        .from(TaskSolutionResult, 'ts')
        .where('ts."courseTaskId" = :taskId', { taskId })
        .groupBy('ts."checkerId"')
        .addGroupBy('ts."score"')
        .having('COUNT(score) = :count', { count: TASK_REVIEW_COUNT })
        .getQuery();
      return `ts."checkerId" IN ${subQuery}`;
    })
    .andWhere('ts."score" NOT BETWEEN "studentAvg"."avg" * :low AND "studentAvg"."avg" * :high', {
      low: LOW_ERROR_RATE,
      high: HIGH_ERROR_RATE,
    })
    .andWhere('ts."courseTaskId" = :taskId', { taskId })
    .orderBy('"checkerUser"."githubId"')
    .getRawMany();

  return data.map(e => {
    return {
      ...e,
      studentAvgScore: Number(e.studentAvgScore),
      key: `${e.checkerGithubId}.${e.studentGithubId}.${e.taskName}`,
    };
  });
}

/* Get checkers who passed not max score with short comment */
export async function getCheckersWithoutComments(taskId: number) {
  const data = await getRepository(TaskSolutionResult)
    .createQueryBuilder('ts')
    .select('t.name', 'taskName')
    .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
    .addSelect('"studentUser"."githubId"', 'studentGithubId')
    .addSelect('ts.score', 'checkerScore')
    .addSelect('ts.comment', 'comment')
    .innerJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
    .innerJoin(Task, 't', 'ct."taskId" = t.id')
    .innerJoin(Student, 'checker', 'ts."checkerId" = checker.id ')
    .innerJoin(User, 'checkerUser', 'checker."userId" = "checkerUser".id')
    .innerJoin(Student, 'student', 'ts."studentId" = student.id ')
    .innerJoin(User, 'studentUser', 'student."userId" = "studentUser".id')
    .where(`LENGTH(ts.comment) < ${MIN_LENGTH_MESSAGE}`)
    .andWhere('ts.score < ct."maxScore"')
    .andWhere('ts."courseTaskId" = :taskId', { taskId })
    .andWhere('json_array_length(ts."historicalScores") < 2')
    .orderBy('"checkerUser"."githubId"')
    .getRawMany();

  return data.map(e => {
    return { ...e, key: `${e.checkerGithubId}.${e.studentGithubId}.${e.taskName}` };
  });
}
