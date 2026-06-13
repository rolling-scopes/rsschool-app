import { BadRequestException, Injectable } from '@nestjs/common';
import { Task } from '@entities/task';
import { User } from '@entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { Repository } from 'typeorm';
import { Student } from '@entities/student';
import { TaskSolution } from '@entities/taskSolution';
import {
  CrossCheckMessage,
  CrossCheckMessageAuthorRole,
  ScoreRecord,
  TaskSolutionResult,
} from '@entities/taskSolutionResult';
import { CourseTask, CrossCheckStatus } from '@entities/courseTask';
import { DataSource } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PersonDto } from 'src/core/dto';
import { CrossCheckCriteriaDataDto, CrossCheckMessageDto } from './dto';
import { Discord } from 'src/profile/dto';
import { CrossCheckDistributionService } from './cross-check-distribution';

export type CrossCheckPair = {
  id: number;
  score: number;
  comment: string;
  student: Pick<User, 'githubId' | 'id' | 'firstName' | 'lastName'>;
  checker: Pick<User, 'githubId' | 'id' | 'firstName' | 'lastName'>;
  privateRepository?: string;
  historicalScores: null | ScoreRecord[];
  messages: null | CrossCheckMessage[];
  url: string;
  courseTask: Pick<Task, 'id' | 'name'>;
  submittedDate: string;
  reviewedDate: string;
};

export type Pagination = {
  pageSize: number;
  current: number;
  total: number;
  totalPages: number;
};

export type AvailableCrossCheckStats = {
  name: string;
  id: number;
  checksCount: number;
  completedChecksCount: number;
};

enum FilterField {
  Checker = 'checker',
  Student = 'student',
  Url = 'url',
  Task = 'task',
}

export enum OrderField {
  Checker = 'checker',
  Student = 'student',
  Url = 'url',
  Task = 'task',
  Score = 'score',
  ReviewedDate = 'reviewedDate',
  SubmittedDate = 'submittedDate',
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

const orderFieldMapping: Record<OrderField, string> = {
  checker: 'chu.githubId',
  student: 'stu.githubId',
  task: 't.name',
  score: 'tsr.score',
  url: 'ts.url',
  submittedDate: 'ts.updatedDate',
  reviewedDate: 'tsr.updatedDate',
};

export type CrossCheckSolutionReview = {
  id: number;
  dateTime: number;
  comment: string;
  criteria?: CrossCheckCriteriaDataDto[];
  author: {
    id: number;
    name: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  score: number;
  messages: CrossCheckMessageDto[];
};

@Injectable()
export class CourseCrossCheckService {
  private readonly crossCheckDistributionService = new CrossCheckDistributionService();

  constructor(
    @InjectRepository(TaskSolutionChecker)
    private readonly taskSolutionCheckerRepository: Repository<TaskSolutionChecker>,
    @InjectRepository(TaskSolution)
    private readonly taskSolutionRepository: Repository<TaskSolution>,
    @InjectRepository(TaskSolutionResult)
    private readonly TaskSolutionResultRepository: Repository<TaskSolutionResult>,
    @InjectRepository(CourseTask)
    private readonly courseTaskRepository: Repository<CourseTask>,
    private readonly dataSource: DataSource,
  ) {}

  public async getCourseTask(courseTaskId: number) {
    return this.courseTaskRepository
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .where('courseTask.id = :courseTaskId', { courseTaskId })
      .getOne();
  }

  public static isSubmissionDeadlinePassed({ studentEndDate }: CourseTask) {
    const currentTimestamp = Date.now();
    if (!studentEndDate) return false;
    const submitDeadlineTimestamp = new Date(studentEndDate).getTime();
    return currentTimestamp > submitDeadlineTimestamp;
  }

  public async changeCourseTaskStatus(courseTask: CourseTask, crossCheckStatus: CrossCheckStatus) {
    await this.courseTaskRepository.save({ ...courseTask, crossCheckStatus });
  }

  public async getTaskSolutionsWithoutChecker(courseTaskId: number) {
    return this.taskSolutionRepository
      .createQueryBuilder('ts')
      .leftJoin('student', 's', 's."id" = ts.studentId')
      .leftJoin('task_solution_checker', 'tsc', 'tsc."taskSolutionId" = ts.id')
      .where(`ts."courseTaskId" = :courseTaskId`, { courseTaskId })
      .andWhere('tsc.id IS NULL')
      .andWhere('s.isExpelled = false')
      .getMany();
  }

  public async distributeCrossCheck(courseTask: CourseTask, courseTaskId: number) {
    const solutions = await this.getTaskSolutionsWithoutChecker(courseTaskId);
    const solutionsMap = new Map<number, number>();

    await this.changeCourseTaskStatus(courseTask, CrossCheckStatus.Distributed);

    for (const solution of solutions) {
      solutionsMap.set(solution.studentId, solution.id);
    }

    const students = Array.from(solutionsMap.keys());

    if (students.length === 0) {
      return { crossCheckPairs: [] as unknown[] };
    }

    const pairs = this.crossCheckDistributionService.distribute(students, courseTask.pairsCount ?? undefined);
    const crossCheckPairs = pairs
      .filter(pair => solutionsMap.has(pair.studentId))
      .map(pair => ({
        ...pair,
        courseTaskId,
        taskSolutionId: solutionsMap.get(pair.studentId),
      }));

    await this.taskSolutionCheckerRepository.save(crossCheckPairs);

    return { crossCheckPairs };
  }

  public async getTaskSolutionCheckers(courseTaskId: number, minCheckedCount: number) {
    const query = this.dataSource
      .createQueryBuilder()
      .select(['ROUND(AVG("score")) as "score"', '"studentId" '])
      .from(qb => {
        // do sub query to select only top X scores
        const query = qb
          .from(TaskSolutionResult, 'tsr')
          .select([
            'tsr.studentId as "studentId"',
            'tsr.score as "score"',
            'row_number() OVER (PARTITION by tsr.studentId ORDER BY tsr.score desc) as "rownum"',
          ])
          .where(qb => {
            // query students who checked enough tasks
            const query = qb
              .subQuery()
              .select('r."checkerId"')
              .from(TaskSolutionChecker, 'c')
              .leftJoin(
                'task_solution_result',
                'r',
                ['r."checkerId" = c."checkerId"', 'r."studentId" = c."studentId"'].join(' AND '),
              )
              .where(`c."courseTaskId" = :courseTaskId`, { courseTaskId })
              .andWhere('r.id IS NOT NULL')
              .groupBy('r."checkerId"')
              .having(`COUNT(c.id) >= :count`, { count: minCheckedCount })
              .getQuery();
            return `"studentId" IN ${query}`;
          })
          .andWhere('tsr."courseTaskId" = :courseTaskId', { courseTaskId })
          .orderBy('tsr.studentId')
          .orderBy('tsr.score', 'DESC');
        return query;
      }, 's')
      .where('rownum <= :count', { count: minCheckedCount })
      .groupBy('"studentId"');

    const records = await query.getRawMany();

    return records.map(record => ({ studentId: record.studentId, score: Number(record.score) }));
  }

  public async findPairs(
    courseId: number,
    pagination: { pageSize: number; current: number } = { pageSize: 100, current: 1 },
    filter?: Partial<Record<FilterField, string>>,
    order?: {
      orderBy: OrderField;
      orderDirection: OrderDirection;
    },
  ): Promise<{ items: CrossCheckPair[]; pagination: Pagination }> {
    const query = this.taskSolutionCheckerRepository
      .createQueryBuilder('tsc')
      .leftJoin(CourseTask, 'ct', 'tsc."courseTaskId" = ct.id')
      .leftJoin(Task, 't', 't.id = ct."taskId"')
      .leftJoin(Student, 'st', 'tsc."studentId" = st.id')
      .leftJoin(User, 'stu', 'st."userId" = stu.id')
      .leftJoin(Student, 'ch', 'tsc."checkerId" = ch.id')
      .leftJoin(User, 'chu', 'ch."userId" = chu.id')
      .leftJoin(TaskSolution, 'ts', 'ts."courseTaskId" = tsc."courseTaskId" AND ts."studentId" = st."id"')
      .leftJoin(
        TaskSolutionResult,
        'tsr',
        'tsr."courseTaskId" = tsc."courseTaskId" AND tsr."studentId" = tsc."studentId" AND tsr."checkerId" = tsc."checkerId"',
      )
      .addSelect(['tsr.score', 'tsr.comment', 'tsr.updatedDate', 'tsr.historicalScores', 'tsr.messages'])
      .addSelect(['st.repository'])
      .addSelect(['stu.githubId', 'stu.id', 'stu.firstName', 'stu.lastName'])
      .addSelect(['chu.githubId', 'chu.id', 'chu.firstName', 'chu.lastName'])
      .addSelect(['ts.url', 'ts.updatedDate'])
      .addSelect(['t.name', 't.id'])
      .where('ct."courseId" = :courseId', { courseId });

    if (filter?.checker) {
      query.andWhere('chu."githubId" ILIKE :checker', { checker: `%${filter.checker}%` });
    }
    if (filter?.student) {
      query.andWhere('stu."githubId" ILIKE :student', { student: `%${filter.student}%` });
    }
    if (filter?.task) {
      query.andWhere('t.name ILIKE :task', { task: `%${filter.task}%` });
    }
    if (filter?.url) {
      query.andWhere('ts.url ILIKE :url', { url: `%${filter.url}%` });
    }

    if (order?.orderBy && orderFieldMapping[order.orderBy]) {
      query.orderBy(orderFieldMapping[order.orderBy], order.orderDirection ?? 'ASC');
    }

    const [courseTasks, total] = await Promise.all([
      query
        .limit(pagination.pageSize)
        .offset((pagination.current - 1) * pagination.pageSize)
        .getRawMany(),
      query.getCount(),
    ]);

    const result = courseTasks.map((e: any) => {
      return {
        checker: {
          firstName: e.chu_firstName,
          lastName: e.chu_lastName,
          githubId: e.chu_githubId,
          id: e.tsc_checkerId,
        },
        student: {
          firstName: e.stu_firstName,
          lastName: e.stu_lastName,
          githubId: e.stu_githubId,
          id: e.tsc_studentId,
        },
        courseTask: {
          name: e.t_name,
          id: e.tsc_courseTaskId,
        },
        url: e.ts_url,
        privateRepository: e.st_repository,
        score: e.tsr_score,
        comment: e.tsr_comment,
        submittedDate: e.ts_updatedDate,
        reviewedDate: e.tsr_historicalScores?.at(-1)?.dateTime,
        messages: e.tsr_messages,
        historicalScores: e.tsr_historicalScores,
        id: e.tsc_id,
      } as CrossCheckPair;
    });

    return {
      items: result,
      pagination: {
        current: Number(pagination.current),
        pageSize: Number(pagination.pageSize),
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      },
    };
  }

  public async getSolutionsUrls(courseId: number, courseTaskId: number) {
    const query = this.taskSolutionRepository
      .createQueryBuilder('ts')
      .leftJoin(CourseTask, 'ct', 'ts."courseTaskId" = ct.id')
      .leftJoin(Student, 'st', 'ts."studentId" = st.id')
      .leftJoin(User, 'stu', 'stu."id" = st."userId"')
      .addSelect(['stu."githubId"', 'ts.url'])
      .where('ct."courseId" = :courseId', { courseId })
      .andWhere('ct."id" = :courseTaskId', { courseTaskId });

    const rawData = await query.getRawMany<{ githubId: string; url: string }>();

    const result = rawData.map(data => ({
      githubId: data.githubId,
      solutionUrl: data.url,
    }));

    return result;
  }

  public async getAvailableCrossChecksStats(
    tasks: CourseTask[],
    studentId: number,
  ): Promise<AvailableCrossCheckStats[]> {
    const res = await this.taskSolutionCheckerRepository
      .createQueryBuilder('tsc')
      .leftJoin(
        TaskSolutionResult,
        'tsr',
        'tsr."courseTaskId" = tsc."courseTaskId" AND tsr."studentId" = tsc."studentId" AND tsr."checkerId" = tsc."checkerId"',
      )
      .addSelect(['tsr.score'])
      .where('tsc.courseTaskId IN (:...ids)', { ids: tasks.map(i => i.id) })
      .andWhere('tsc."checkerId" = :studentId', { studentId })
      .getRawMany();

    return tasks
      .map(t => {
        const checks = res.filter(el => t.id === el.tsc_courseTaskId);

        return {
          name: t.task.name,
          id: t.id,
          checksCount: checks.length,
          completedChecksCount: checks.filter(c => c.tsr_score !== null).length,
        };
      })
      .filter(el => el.checksCount !== 0);
  }

  public isCrossCheckTask(courseTask: Partial<CourseTask>) {
    return courseTask.checker === 'crossCheck';
  }

  public async getCrossCheckSolutionReviews(
    studentId: number,
    courseTaskId: number,
  ): Promise<CrossCheckSolutionReview[]> {
    const taskSolutionResults = await this.TaskSolutionResultRepository.createQueryBuilder('tsr')
      .select(['tsr.id', 'tsr.comment', 'tsr.anonymous', 'tsr.score', 'tsr.messages', 'tsr.historicalScores'])
      .innerJoin('tsr.checker', 'checker')
      .innerJoin('checker.user', 'user')
      .addSelect(['checker.id', ...UsersService.getPrimaryUserFields('user')])
      .where('"tsr"."studentId" = :studentId', { studentId })
      .andWhere('"tsr"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getMany();

    return taskSolutionResults.map(taskSolutionResult => this.transformToCrossCheckSolutionReview(taskSolutionResult));
  }

  private transformToCrossCheckSolutionReview(taskSolutionResult: TaskSolutionResult): CrossCheckSolutionReview {
    const author = this.extractAuthor(taskSolutionResult);
    const { dateTime, criteria } = this.getLastCheck(taskSolutionResult);
    const messages = this.getMessages(taskSolutionResult);

    return {
      dateTime,
      author,
      messages,
      id: taskSolutionResult.id,
      comment: taskSolutionResult.comment ?? '',
      score: taskSolutionResult.score,
      criteria,
    };
  }

  private extractAuthor(taskSolutionResult: TaskSolutionResult) {
    if (taskSolutionResult.anonymous) {
      return null;
    }

    return {
      id: taskSolutionResult.checker.user.id,
      name: PersonDto.getName(taskSolutionResult.checker.user),
      githubId: taskSolutionResult.checker.user.githubId,
      discord: taskSolutionResult.checker.user.discord,
    };
  }

  private getLastCheck(taskSolutionResult: TaskSolutionResult) {
    const [lastCheck] = taskSolutionResult.historicalScores.sort((a, b) => b.dateTime - a.dateTime);

    if (!lastCheck) {
      throw new BadRequestException('No historical scores found');
    }

    return lastCheck;
  }

  private getMessages(taskSolutionResult: TaskSolutionResult) {
    if (taskSolutionResult.anonymous) {
      return taskSolutionResult.messages.map(message => ({
        ...message,
        author: message.role === CrossCheckMessageAuthorRole.Reviewer ? null : message.author,
      }));
    }

    return taskSolutionResult.messages;
  }

  public async getTaskSolution(studentId: number, courseTaskId: number) {
    const taskSolution = await this.taskSolutionRepository
      .createQueryBuilder('ts')
      .where('"ts"."studentId" = :studentId', { studentId })
      .andWhere('"ts"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();

    return taskSolution;
  }
}
