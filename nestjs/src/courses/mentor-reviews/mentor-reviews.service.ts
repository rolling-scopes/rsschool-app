import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TaskSolution } from '@entities/taskSolution';
import { paginate } from 'src/core/paginate';
import { Checker } from '@entities/courseTask';

@Injectable()
export class MentorReviewsService {
  constructor(
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
  ) {}

  private buildMentorReviewsQuery({
    courseId,
    tasks,
    student,
    sortField,
    sortOrder,
  }: {
    courseId: number;
    tasks?: string;
    student?: string;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const query = this.taskSolutionRepository
      .createQueryBuilder('taskSolution')
      .innerJoin('taskSolution.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('taskSolution.student', 'student')
      .innerJoin('student.user', 'studentUser')
      .leftJoin('student.mentor', 'studentMentor')
      .leftJoin('studentMentor.user', 'studentMentorUser')
      .leftJoinAndSelect(
        'student.taskResults',
        'taskResult',
        'taskResult.courseTaskId = taskSolution.courseTaskId AND taskResult.studentId = taskSolution.studentId',
      )
      .leftJoinAndSelect(
        'student.taskChecker',
        'taskChecker',
        'taskChecker.studentId = taskSolution.studentId AND taskChecker.courseTaskId = taskSolution.courseTaskId',
      )
      .leftJoin('taskChecker.mentor', 'mentor')
      .leftJoin('mentor.user', 'mentorUser')
      .leftJoin('taskResult.lastChecker', 'lastChecker')
      .where('student.courseId = :courseId AND student.isExpelled = false', { courseId })
      .andWhere('courseTask.checker = :checker', { checker: Checker.Mentor })
      .select([
        'student.id',
        'student.mentorId',
        'studentUser.firstName',
        'studentUser.lastName',
        'studentUser.githubId',
        'task.name',
        'task.descriptionUrl',
        'courseTask.maxScore',
        'taskSolution.studentId',
        'taskSolution.url',
        'taskSolution.id',
        'taskSolution.createdDate',
        'taskResult.score',
        'taskResult.lastCheckerId',
        'taskResult.updatedDate',
        'taskChecker.mentorId',
        'taskChecker.mentor',
        'mentor.id',
        'mentorUser.githubId',
        'studentMentor.id',
        'studentMentorUser.githubId',
        'lastChecker.githubId',
      ]);

    if (tasks) {
      const taskIds = tasks.split(',').map(id => parseInt(id));
      query.andWhere('courseTask.id IN (:...taskIds)', { taskIds });
    }

    if (student) {
      query.andWhere('studentUser.githubId ILIKE :student', { student: `%${student}%` });
    }

    if (sortField && sortOrder) {
      if (sortField === 'submittedAt') {
        query.addOrderBy('taskSolution.createdDate', sortOrder);
      }

      if (sortField === 'reviewedAt') {
        query.addOrderBy('taskResult.updatedDate', sortOrder);
      }
    } else {
      query.addOrderBy('taskSolution.id', 'ASC');
    }

    return query;
  }

  public async getMentorReviews(
    courseId: number,
    page: number,
    limit: number,
    tasks?: string,
    student?: string,
    sortField?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    const query = this.buildMentorReviewsQuery({ courseId, tasks, student: student, sortField, sortOrder });
    const data = await paginate(query, { page, limit });

    return data;
  }
}
