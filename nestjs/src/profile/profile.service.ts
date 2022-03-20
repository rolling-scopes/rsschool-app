import { Course } from '@entities/course';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser } from 'src/auth';
import { In, Repository } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  public async getCourses(authUser: AuthUser): Promise<Course[]> {
    const courseIds = Object.keys(authUser.courses).map(Number);

    return this.courseRepository.find({
      where: { id: In(courseIds) },
      order: {
        startDate: 'DESC',
      },
    });
  }
}
