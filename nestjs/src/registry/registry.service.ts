import { User } from '@entities/user';
import { MentorRegistry } from '@entities/mentorRegistry';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(MentorRegistry)
    private mentorsRegistryRepository: Repository<MentorRegistry>,
    private usersService: UsersService,
    private coursesService: CoursesService,
  ) {}

  public async approveMentor(githubId: string, preselectedCourses: string[]): Promise<User> {
    const user = await this.usersService.getByGithubId(githubId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.mentorsRegistryRepository.update({ userId: user.id }, { preselectedCourses });
    return user;
  }

  public async buildMentorApprovalData(preselectedCourses: string[]) {
    const courses = await this.coursesService.getByIds(preselectedCourses.map(id => parseInt(id)));

    return {
      courses,
    };
  }
}
