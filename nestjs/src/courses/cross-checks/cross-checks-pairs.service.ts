import { Injectable } from '@nestjs/common';
import { Task } from '@entities/task';
import { User } from '@entities/user';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { Repository } from 'typeorm';
import { Student } from '@entities/student';
import { TaskSolution } from '@entities/taskSolution';
import { TaskSolutionResult } from '@entities/taskSolutionResult';
import { CourseTask } from '@entities/courseTask';

export type CrossCheckPair = {
  id: number;
  score: number;
  comment: string;
  student: Pick<User, 'githubId' | 'id' | 'firstName' | 'lastName'>;
  checker: Pick<User, 'githubId' | 'id' | 'firstName' | 'lastName'>;
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

@Injectable()
export class CrossCheckPairsService {
  constructor(
    @InjectRepository(TaskSolutionChecker)
    private readonly taskSolutionCheckerRepository: Repository<TaskSolutionChecker>,
  ) {}

  public async findPairs(
    courseId: number,
    pagination: { pageSize: number; current: number } = { pageSize: 100, current: 1 },
    filter?: Partial<Record<FilterField, string>>,
    order?: {
      orderBy: OrderField;
      orderDirection: OrderDirection;
    },
  ): Promise<{ items: CrossCheckPair[]; pagination: any }> {
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
      .addSelect(['tsr.score', 'tsr.comment', 'tsr.updatedDate'])
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
        score: e.tsr_score,
        comment: e.tsr_comment,
        submittedDate: e.ts_updatedDate,
        reviewedDate: e.tsr_updatedDate,
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
}
