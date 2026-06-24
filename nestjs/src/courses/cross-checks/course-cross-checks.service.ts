import { BadRequestException, Injectable } from '@nestjs/common';
import { Task } from '@entities/task';
import { User } from '@entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { Repository } from 'typeorm';
import { Student } from '@entities/student';
import { TaskSolution, TaskSolutionComment, TaskSolutionReview } from '@entities/taskSolution';
import {
  CrossCheckCriteriaData,
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
import { WriteScoreService } from '../score/write-score.service';
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
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly writeScoreService: WriteScoreService,
  ) {}

  private static readonly DEFAULT_PAIRS_COUNT = 4;

  public static isCrossCheckTask(courseTask: Partial<CourseTask>) {
    return courseTask.checker === 'crossCheck';
  }

  // Orchestrates cross-check distribution; shared by the controller endpoint and the daily cron.
  public async runDistribution(courseTaskId: number) {
    const courseTask = await this.getCourseTask(courseTaskId);

    if (courseTask == null) {
      throw new BadRequestException();
    }
    if (!CourseCrossCheckService.isSubmissionDeadlinePassed(courseTask)) {
      throw new BadRequestException();
    }

    return this.distributeCrossCheck(courseTask, courseTaskId);
  }

  // Orchestrates cross-check completion (scoring + status change); shared by the controller endpoint and the daily cron.
  public async runCompletion(courseTaskId: number) {
    const courseTask = await this.getCourseTask(courseTaskId);

    if (courseTask == null) {
      throw new BadRequestException();
    }
    if (
      !CourseCrossCheckService.isSubmissionDeadlinePassed(courseTask) ||
      courseTask.crossCheckStatus === CrossCheckStatus.Initial
    ) {
      throw new BadRequestException();
    }

    const pairsCount = Math.max((courseTask.pairsCount ?? CourseCrossCheckService.DEFAULT_PAIRS_COUNT) - 1, 1);
    const studentScores = await this.getTaskSolutionCheckers(courseTaskId, pairsCount);

    for (const studentScore of studentScores) {
      const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
      await this.writeScoreService.saveScore(studentScore.studentId, courseTaskId, data);
    }

    await this.changeCourseTaskStatus(courseTask, CrossCheckStatus.Completed);
  }

  public async getCourseTaskWithCourse(courseTaskId: number) {
    return this.courseTaskRepository
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .innerJoinAndSelect('courseTask.course', 'course')
      .where('courseTask.id = :courseTaskId', { courseTaskId })
      .getOne();
  }

  public static isValidTaskSolution(data: Partial<TaskSolution>) {
    if (!data.url) {
      return false;
    }
    if (data.comments && !Array.isArray(data.comments)) {
      return false;
    }
    if (data.review && !Array.isArray(data.review)) {
      return false;
    }
    return true;
  }

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

  public async getTaskDetails(courseTaskId: number) {
    const courseTask = await this.courseTaskRepository
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .where('courseTask.id = :courseTaskId', { courseTaskId })
      .getOne();

    const studentEndDate = courseTask?.studentEndDate;
    const criteria = courseTask?.task?.attributes?.criteria ?? [];
    return { criteria, studentEndDate };
  }

  public async queryStudentByGithubId(courseId: number, githubId: string) {
    const record = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return {
      id: record.id,
      name: CourseCrossCheckService.buildName(record.user),
      githubId: record.user.githubId,
      userId: record.user.id,
    };
  }

  public async getTaskSolutionResultById(id: number) {
    return this.TaskSolutionResultRepository.createQueryBuilder('taskSolutionResult')
      .where('"taskSolutionResult"."id" = :id', { id })
      .getOne();
  }

  public async saveMessage(
    taskSolutionResultId: number,
    data: { content: string; role: CrossCheckMessageAuthorRole },
    params: { user: { id: number; githubId: string } },
  ) {
    const { user } = params;

    const message: CrossCheckMessage = {
      ...data,
      timestamp: new Date().toISOString(),
      author: {
        id: user.id,
        githubId: user.githubId,
      },
      isReviewerRead: data.role === CrossCheckMessageAuthorRole.Reviewer,
      isStudentRead: data.role === CrossCheckMessageAuthorRole.Student,
    };

    const taskSolutionResultById = await this.getTaskSolutionResultById(taskSolutionResultId);

    if (taskSolutionResultById) {
      const { messages } = taskSolutionResultById;

      messages.push(message);
      await this.TaskSolutionResultRepository.update(taskSolutionResultById.id, { messages });
    }
  }

  public async updateMessage(taskSolutionResultId: number, data: { role: CrossCheckMessageAuthorRole }) {
    const { role } = data;

    const taskSolutionResultById = await this.getTaskSolutionResultById(taskSolutionResultId);

    if (taskSolutionResultById) {
      const { messages } = taskSolutionResultById;

      const updatedMessages = messages.map(message => ({
        ...message,
        isReviewerRead: CrossCheckMessageAuthorRole.Reviewer === role ? true : message.isReviewerRead,
        isStudentRead: CrossCheckMessageAuthorRole.Student === role ? true : message.isStudentRead,
      }));

      await this.TaskSolutionResultRepository.update(taskSolutionResultById.id, { messages: updatedMessages });
    }
  }

  public async getMessageRecipientId(studentId: number, checkerId: number, role: CrossCheckMessageAuthorRole) {
    if (role === CrossCheckMessageAuthorRole.Reviewer) {
      return studentId;
    }

    const checker = await this.studentRepository.findOne({ where: { id: checkerId } });

    return checker?.userId;
  }

  public async saveSolution(studentId: number, courseTaskId: number, data: Partial<TaskSolution>) {
    const existingResult = await this.getTaskSolution(studentId, courseTaskId);
    if (existingResult != null) {
      await this.taskSolutionRepository.save({
        ...existingResult,
        ...data,
        comments: existingResult.comments.concat(data.comments ?? []),
      });
      return;
    }

    await this.taskSolutionRepository.save({
      studentId,
      courseTaskId,
      url: data.url,
      review: data.review,
      comments: data.comments,
    });
  }

  public async deleteSolution(studentId: number, courseTaskId: number) {
    await this.taskSolutionRepository.delete({ studentId, courseTaskId });
  }

  public async getTaskSolutionAssignments(checkerId: number, courseTaskId: number) {
    return this.taskSolutionCheckerRepository
      .createQueryBuilder('taskSolutionChecker')
      .innerJoinAndSelect('taskSolutionChecker.taskSolution', 'taskSolution')
      .innerJoinAndSelect('taskSolutionChecker.student', 'student')
      .innerJoin('student.user', 'user')
      .addSelect(UsersService.getPrimaryUserFields())
      .where('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId })
      .andWhere('"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getMany();
  }

  // the assignments query never selects student.mentor, so the legacy convertToStudentBasic
  // always resolved mentor to null on this path
  public static convertToStudentBasic(student: Student) {
    const user = student.user;
    return {
      name: CourseCrossCheckService.buildName(user),
      isActive: !student.isExpelled && !student.isFailed,
      id: student.id,
      githubId: user.githubId,
      mentor: null,
      cityName: user.cityName ?? '',
      countryName: user.countryName ?? '',
      discord: user.discord,
      totalScore: student.totalScore,
    };
  }

  public async getTaskSolutionChecker(studentId: number, checkerId: number, courseTaskId: number) {
    return this.taskSolutionCheckerRepository
      .createQueryBuilder('taskSolutionChecker')
      .where('"taskSolutionChecker"."studentId" = :studentId', { studentId })
      .andWhere('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId })
      .andWhere('"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
  }

  public async saveResult(
    courseTaskId: number,
    studentId: number,
    checkerId: number,
    data: { score: number; anonymous?: boolean; comment: string; review?: TaskSolutionReview[] },
    params: { userId: number; criteria: CrossCheckCriteriaData[] },
  ) {
    const { userId } = params;
    const historicalResult = { ...data, criteria: params.criteria, authorId: userId, dateTime: Date.now() };

    const existing = await this.getTaskSolutionResult(studentId, checkerId, courseTaskId);

    if (existing != null) {
      const { historicalScores } = existing;
      const previousScore = { ...existing };
      historicalScores.push(historicalResult);
      await this.TaskSolutionResultRepository.update(existing.id, { ...data, historicalScores });
      if (previousScore.comment !== data.comment || previousScore.score !== data.score) {
        return previousScore;
      }
    } else {
      await this.TaskSolutionResultRepository.insert({
        studentId: studentId,
        checkerId: checkerId,
        courseTaskId,
        historicalScores: [historicalResult],
        messages: [],
        ...data,
      });
    }
  }

  public async saveSolutionComments(
    studentId: number,
    courseTaskId: number,
    data: {
      comments: TaskSolutionComment[];
      authorId: number;
      authorGithubId: string;
      recipientId?: number;
    },
  ) {
    const taskSolution = await this.getTaskSolution(studentId, courseTaskId);
    if (taskSolution == null) {
      throw new Error(`Cross check solution not found StudentId=[${studentId} CourseTask=[${courseTaskId}]`);
    }
    const comments = data.comments.reduce((acc, comment) => {
      if (acc.some(c => c.criteriaId === comment.criteriaId && c.timestamp === comment.timestamp)) {
        return acc;
      }
      return acc.concat([{ ...comment, authorId: data.authorId, recipientId: data.recipientId }]);
    }, taskSolution.comments);

    await this.taskSolutionRepository.save({ id: taskSolution.id, comments });
  }

  private async getTaskSolutionResult(studentId: number, checkerId: number, courseTaskId: number) {
    return this.TaskSolutionResultRepository.createQueryBuilder('taskSolutionResult')
      .where('"taskSolutionResult"."studentId" = :studentId', { studentId })
      .andWhere('"taskSolutionResult"."checkerId" = :checkerId', { checkerId })
      .andWhere('"taskSolutionResult"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
  }

  public async getResult(courseTaskId: number, studentId: number, checkerId: number, checkerGithubId: string) {
    const [reviewResult, solution] = await Promise.all([
      this.findReviewResult(courseTaskId, studentId, checkerId),
      this.findSolution(courseTaskId, studentId),
    ]);
    if (reviewResult == null || solution == null) {
      return null;
    }

    let comments: Array<{
      text: string;
      timestamp: number;
      criteriaId: string;
      authorId: number;
      authorGithubId?: string | null;
    }> =
      solution.comments
        ?.filter(c => c.recipientId == null || c.authorId === checkerId || c.recipientId === checkerId)
        .map(c => ({
          text: c.text,
          timestamp: c.timestamp,
          criteriaId: c.criteriaId,
          authorId: c.authorId,
        })) ?? [];

    const data = await this.findByStudentIds(comments.map(c => c.authorId).filter(c => c));

    const checkerData = await this.getUserByGithubId(checkerGithubId);

    comments = comments.map(c => ({
      ...c,
      authorGithubId:
        !reviewResult.anonymous || c.authorId === solution.studentId || c.authorId === checkerId
          ? data.find(d => d.studentId === c.authorId)?.githubId
          : null,
    }));
    return {
      id: reviewResult.id,
      score: reviewResult.score,
      comment: reviewResult.comment ?? '',
      anonymous: reviewResult.anonymous,
      review: reviewResult.review,
      checkerId,
      studentId,
      author: {
        id: checkerData?.id ?? 0,
        name: CourseCrossCheckService.buildName({
          firstName: checkerData?.firstName ?? '',
          lastName: checkerData?.lastName ?? '',
        }),
        githubId: checkerGithubId,
        discord: checkerData?.discord ?? null,
      },
      comments,
      historicalScores: reviewResult.historicalScores ?? [],
      messages: reviewResult.messages,
    };
  }

  private async findReviewResult(courseTaskId: number, studentId: number, checkerId: number) {
    const item = await this.TaskSolutionResultRepository.createQueryBuilder('result')
      .where('result."studentId" = :studentId', { studentId })
      .andWhere('result."checkerId" = :checkerId', { checkerId })
      .andWhere('result."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
    return item;
  }

  private async findSolution(courseTaskId: number, studentId: number) {
    const item = await this.taskSolutionRepository
      .createQueryBuilder('solution')
      .where('solution."studentId" = :studentId', { studentId })
      .andWhere('solution."courseTaskId" = :courseTaskId', { courseTaskId })
      .getOne();
    return item;
  }

  private async findByStudentIds(studentIds: number[]): Promise<{ studentId: number; githubId: string }[]> {
    if (!studentIds || studentIds.length === 0) {
      return [];
    }
    const data = await this.studentRepository
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')
      .addSelect(['s.id', 'u.githubId'])
      .where('s.id IN (:...ids)', { ids: studentIds })
      .getMany();

    return data.map(s => ({
      studentId: s.id,
      githubId: s.user.githubId,
    }));
  }

  private getUserByGithubId(id: string) {
    const githubId = id.toLowerCase();
    return this.userRepository.findOne({ where: { githubId } });
  }

  private static buildName({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
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

  private static readonly LOW_ERROR_RATE = 0.9;
  private static readonly HIGH_ERROR_RATE = 1.1;
  private static readonly MIN_LENGTH_MESSAGE = 70;

  /* Get checkers who passed max score for everyone and maybe didn't review task */
  public async getCheckersWithMaxScore(taskId: number) {
    const data = await this.TaskSolutionResultRepository.createQueryBuilder('ts')
      .select('t.name', 'taskName')
      .addSelect('"checkerUser"."githubId"', 'checkerGithubId')
      .addSelect('"studentUser"."githubId"', 'studentGithubId')

      // Get students whose work has been checked by at least 3 checkers and
      // calculate the average score using the leave-one-out strategy.

      .addSelect(
        `
      CASE
        WHEN "studentScoreSumCnt"."cnt" >= 3
        THEN ROUND(("studentScoreSumCnt"."sum" - ts."score") / ("studentScoreSumCnt"."cnt" - 1), 1)
        ELSE NULL
      END
    `,
        'studentAverageScoreExcludeChecker',
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

      // Get students whose work has been checked by at least 3 checkers and
      // verify that the score given by the checker does not exceed +/- 10% of the average score.

      .andWhere(
        `
      "studentScoreSumCnt"."cnt" >= 3
      AND ts."score" NOT BETWEEN
        (("studentScoreSumCnt"."sum" - ts."score")::numeric / ("studentScoreSumCnt"."cnt" - 1)) * (:low)::numeric
        AND (("studentScoreSumCnt"."sum" - ts."score")::numeric / ("studentScoreSumCnt"."cnt" - 1)) * (:high)::numeric
    `,
        { low: CourseCrossCheckService.LOW_ERROR_RATE, high: CourseCrossCheckService.HIGH_ERROR_RATE },
      )
      .orderBy('"checkerUser"."githubId"')
      .getRawMany();

    return data.map(e => {
      return {
        ...e,
        studentAvgScore: Number(e.studentAverageScoreExcludeChecker),
        key: `${e.checkerGithubId}.${e.studentGithubId}.${e.taskName}`,
      };
    });
  }

  /* Get checkers who passed not max score with short comment */
  public async getCheckersWithoutComments(taskId: number) {
    const data = await this.TaskSolutionResultRepository.createQueryBuilder('ts')
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
      .where('LENGTH(ts.comment) < :length', { length: CourseCrossCheckService.MIN_LENGTH_MESSAGE })
      .andWhere('ts.score < ct."maxScore"')
      .andWhere('ts."courseTaskId" = :taskId', { taskId })
      .andWhere('json_array_length(ts."historicalScores") < 2')
      .orderBy('"checkerUser"."githubId"')
      .getRawMany();

    return data.map(e => {
      return { ...e, key: `${e.checkerGithubId}.${e.studentGithubId}.${e.taskName}` };
    });
  }
}
