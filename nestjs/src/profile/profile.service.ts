import { Course } from '@entities/course';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private userService: UserService,
  ) {}

  public async getCourses(githubId: string): Promise<Course[]> {
    const user = await this.userService.getFullUserByGithubId(githubId);

    const courseIds = [
      ...new Set(
        user.students
          .map(s => s.courseId)
          .concat(user.mentors.map(m => m.courseId))
          .concat(user.courseUsers.map(cu => cu.courseId)),
      ),
    ];

    return this.courseRepository.find({
      where: { id: In(courseIds) },
      order: {
        startDate: 'DESC',
      },
    });
  }
}
