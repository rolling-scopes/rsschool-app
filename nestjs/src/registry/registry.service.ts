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

  public async cancelMentorRegistry(githubId: string) {
    const user = await this.usersService.getByGithubId(githubId);
    if (user == null) {
      throw new BadRequestException('User not found');
    }
    await this.mentorsRegistryRepository.update({ userId: user.id }, { canceled: true });
  }

  private getPreparedMentorRegistriesQuery() {
    return this.mentorsRegistryRepository
      .createQueryBuilder('mentorRegistry')
      .innerJoin('mentorRegistry.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.githubId',
        'user.primaryEmail',
        'user.cityName',
        'user.contactsEpamEmail',
      ])
      .leftJoin('user.mentors', 'mentor')
      .leftJoin('user.students', 'student')
      .leftJoin('student.certificate', 'certificate')
      .addSelect(['mentor.id', 'mentor.courseId', 'student.id', 'certificate.id'])
      .orderBy('"mentorRegistry"."updatedDate"', 'DESC');
  }

  public async findAllMentorRegistries() {
    const mentorRegistries = await this.getPreparedMentorRegistriesQuery()
      .andWhere('mentorRegistry.canceled = false')
      .getMany();
    return mentorRegistries;
  }

  public async findMentorRegistriesByCourseIdsAndDisciplines(coursesIds: number[], disciplines: string[]) {
    const mentorRegistries = await this.getPreparedMentorRegistriesQuery()
      .where(`string_to_array(mentorRegistry.preferedCourses, ',') && :ids`, { ids: coursesIds })
      .andWhere('mentorRegistry.canceled = false')
      .orWhere(`string_to_array(mentorRegistry.technicalMentoring, ',') && :disciplines`, { disciplines })
      .andWhere('mentorRegistry.canceled = false')
      .getMany();
    return mentorRegistries;
  }

  public async buildMentorApprovalData(preselectedCourses: string[]) {
    const courses = await this.coursesService.getByIds(preselectedCourses.map(id => parseInt(id)));

    return {
      courses,
    };
  }
}
