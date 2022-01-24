import { Checker, CourseTask } from '@entities/courseTask';
import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseTasksService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getAll(courseId: number) {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false },
      relations: ['task'],
    });
  }

  public getByOwner(username: string) {
    return this.courseTaskRepository
      .createQueryBuilder('t')
      .leftJoin(User, 'u', 'u.id = t.taskOwnerId')
      .where(`t.checker = :checker`, { checker: Checker.TaskOwner })
      .andWhere('u.githubId = :username', { username })
      .getMany();
  }
}
