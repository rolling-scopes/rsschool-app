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

  private buildMentorReviewsQuery({ courseId }: { courseId: number }) {
    return this.taskSolutionRepository
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
      .where('student.courseId = :courseId', { courseId })
      .andWhere('courseTask.checker = :checker', { checker: Checker.Mentor })
      .andWhere('student.isExpelled = false')
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
      ])
      .addOrderBy('taskSolution.id', 'ASC');
  }

  public async getMentorReviews(courseId: number, page: number, limit: number) {
    const query = this.buildMentorReviewsQuery({ courseId });
    const data = await paginate(query, { page, limit });

    return data;
  }
}
