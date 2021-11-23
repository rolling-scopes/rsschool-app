import { Injectable } from '@nestjs/common';
import { CourseUser } from '@entities/courseUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseUserService {
  constructor(
    @InjectRepository(CourseUser)
    readonly courseUserRepository: Repository<CourseUser>,
  ) {}

  public getByUserId(userId: number): Promise<CourseUser[]> {
    return this.courseUserRepository.find({
      select: ['id', 'courseId', 'userId'],
      where: { userId },
    });
  }
}
