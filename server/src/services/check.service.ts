import { getRepository } from 'typeorm';
import { CourseTask, Student, Task, TaskSolutionResult, User } from '../models';

const LOW_ERROR_RATE = 0.9;
const HIGH_ERROR_RATE = 1.1;
const MIN_LENGTH_MESSAGE = 70;

/* Get checkers who passed max score for everyone and maybe didn't review task*/
export async function getCheckersWithMaxScore(taskId: number) {
  const data = await getRepository(TaskSolutionResult)
    .createQueryBuilder('ts')
    .select('t.name', 'taskName')
    .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
    .addSelect('"studentUser"."githubId"', 'studentGithubId')
    .addSelect(
      `
      CASE
        WHEN "studentScoreSumCnt"."cnt" > 2
        THEN ROUND(("studentScoreSumCnt"."sum" - ts."score") / ("studentScoreSumCnt"."cnt" - 1), 1)
        ELSE NULL
      END
    `,
      'avg_excl_checker',
    )
    .addSelect('ts.score', 'checkerScore')
    .innerJoin(
      qb =>
        qb
          .subQuery()
          .select('tsr."studentId"')
          .addSelect('SUM(tsr.score)', 'sum')
          .addSelect('COUNT(*)', 'cnt')
          .from(TaskSolutionResult, 'tsr')
          .where('tsr."courseTaskId" = :taskId', { taskId })
          .groupBy('tsr."studentId"'),
      'studentScoreSumCnt',
      'ts."studentId" = "studentScoreSumCnt"."studentId"',
    )
    .innerJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
    .innerJoin(Task, 't', 'ct."taskId" = t.id')
    .innerJoin(Student, 'checker', 'ts."checkerId" = checker.id ')
    .innerJoin(User, 'checkerUser', 'checker."userId" = "checkerUser".id')
    .innerJoin(Student, 'student', 'ts."studentId" = student.id ')
    .innerJoin(User, 'studentUser', 'student."userId" = "studentUser".id')
    .where('ts."courseTaskId" = :taskId', { taskId })
    .andWhere(
      `
      "studentScoreSumCnt"."cnt" >= 3
      AND ts."score" NOT BETWEEN
        (("studentScoreSumCnt"."sum" - ts."score")::numeric / ("studentScoreSumCnt"."cnt" - 1)) * (:low)::numeric
        AND (("studentScoreSumCnt"."sum" - ts."score")::numeric / ("studentScoreSumCnt"."cnt" - 1)) * (:high)::numeric
    `,
      { low: LOW_ERROR_RATE, high: HIGH_ERROR_RATE },
    )
    .orderBy('"checkerUser"."githubId"')
    .getRawMany();

  return data.map(e => {
    return {
      ...e,
      studentAvgScore: Number(e.avg_excl_checker),
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
    .where('LENGTH(ts.comment) < :length', { length: MIN_LENGTH_MESSAGE })
    .andWhere('ts.score < ct."maxScore"')
    .andWhere('ts."courseTaskId" = :taskId', { taskId })
    .andWhere('json_array_length(ts."historicalScores") < 2')
    .orderBy('"checkerUser"."githubId"')
    .getRawMany();

  return data.map(e => {
    return { ...e, key: `${e.checkerGithubId}.${e.studentGithubId}.${e.taskName}` };
  });
}
