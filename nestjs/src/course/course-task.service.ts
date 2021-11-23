import { Injectable } from '@nestjs/common';
import { CourseTask } from '@entities/courseTask';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user';

@Injectable()
export class CourseTaskService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getByOwner(username: string) {
    return this.courseTaskRepository
      .createQueryBuilder('t')
      .select('t.courseId')
      .leftJoin(User, 'u', 'u.id = t.taskOwnerId')
      .where(`t.checker = 'taskOwner'`)
      .andWhere('u.githubId = :username', { username })
      .getMany();
  }
}
