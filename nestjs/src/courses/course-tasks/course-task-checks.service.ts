import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSolutionResult } from '@entities/taskSolutionResult';

const LOW_ERROR_RATE = 0.9;
const HIGH_ERROR_RATE = 1.1;
const TASK_REVIEW_COUNT = 4;
const MIN_LENGTH_MESSAGE = 70;

@Injectable()
export class CourseTaskChecksService {
  constructor(
    @InjectRepository(TaskSolutionResult)
    private taskSolutionResultRepository: Repository<TaskSolutionResult>,
  ) {}

  /**
   * Get checkers who passed not max score with short comment
   */
  public async getCheckersWithoutComments(taskId: number) {
    const data = await this.taskSolutionResultRepository
      .createQueryBuilder('ts')
      .select('ts.score', 'checkerScore')
      .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
      .addSelect('"studentUser"."githubId"', 'studentGithubId')
      .addSelect('ts.comment', 'comment')
      .innerJoin('ts.courseTask', 'ct')
      .innerJoin('ts.checker', 'checker')
      .innerJoin('checker.user', 'checkerUser')
      .innerJoin('ts.student', 'student')
      .innerJoin('student.user', 'studentUser')
      .where('LENGTH(ts.comment) < :length', { length: MIN_LENGTH_MESSAGE })
      .andWhere('ts.score < ct."maxScore"')
      .andWhere('ts."courseTaskId" = :taskId', { taskId })
      .andWhere('json_array_length(ts."historicalScores") < 2')
      .orderBy('"checkerUser"."githubId"')
      .getRawMany();

    return data;
  }

  /**
   * Get checkers who passed max score for everyone and maybe didn't review task
   */
  public async getCheckersWithMaxScore(taskId: number) {
    const data = await this.taskSolutionResultRepository
      .createQueryBuilder('ts')
      .select('ts.score', 'checkerScore')
      .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
      .addSelect('"studentUser"."githubId"', 'studentGithubId')
      .addSelect('round("studentAvg"."avg", 1)', 'studentAvgScore')
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
      .innerJoin('ts.courseTask', 'ct')
      .innerJoin('ts.checker', 'checker')
      .innerJoin('checker.user', 'checkerUser')
      .innerJoin('ts.student', 'student')
      .innerJoin('student.user', 'studentUser')
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
      };
    });
  }
}
