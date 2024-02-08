import { uniqBy } from 'lodash';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';
import { User } from '@entities/user';
import { MentorRegistry } from '@entities/mentorRegistry';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(MentorRegistry)
    private mentorsRegistryRepository: Repository<MentorRegistry>,
    private usersService: UsersService,
    private coursesService: CoursesService,
    private disciplinesService: DisciplinesService,
  ) {}

  public async approveMentor(githubId: string, preselectedCourses: string[]): Promise<User> {
    const user = await this.usersService.getByGithubId(githubId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.mentorsRegistryRepository.update({ userId: user.id }, { preselectedCourses, sendDate: new Date() });
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

  public async commentMentorRegistry(githubId: string, comment: string | null) {
    const user = await this.usersService.getByGithubId(githubId);
    if (user == null) {
      throw new BadRequestException('User not found');
    }
    await this.mentorsRegistryRepository.update({ userId: user.id }, { comment: comment ?? undefined });
  }

  public async getMentorsFromRegistryCourseIds(githubId: string) {
    const result = await this.mentorsRegistryRepository
      .createQueryBuilder('mentorRegistry')
      .select(['mentorRegistry.preferedCourses', 'mentorRegistry.technicalMentoring'])
      .leftJoin('mentorRegistry.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .andWhere('"mentorRegistry".canceled = false')
      .getOne();

    const disciplines = await this.disciplinesService.getByNames(result?.technicalMentoring ?? []);
    const disciplinesIds = disciplines.map(({ id }) => id);
    const coursesByDiscipline = (await this.coursesService.getByDisciplineIds(disciplinesIds)) ?? [];
    const preferredCourses = result?.preferedCourses?.map(courseId => ({ courseId: Number(courseId) })) ?? [];
    const courseIdsByDisciplines = coursesByDiscipline.map(({ id }) => ({ courseId: id }));
    const courseIds = uniqBy(preferredCourses.concat(courseIdsByDisciplines), ({ courseId }) => courseId);

    return courseIds;
  }
}
