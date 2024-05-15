import { User } from '@entities/user';
import { MentorRegistry } from '@entities/mentorRegistry';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { paginate } from 'src/core/paginate';

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
      .orderBy('mentorRegistry.updatedDate', 'DESC');
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

  public async filterMentorRegistries({
    githubId,
    page,
    limit,
    cityName,
    preselectedCourses,
    preferedCourses,
    technicalMentoring,
  }: {
    githubId?: string;
    cityName?: string;
    page: number;
    limit: number;
    preselectedCourses?: number[];
    preferedCourses?: number[];
    technicalMentoring?: string[];
  }) {
    const req = this.getPreparedMentorRegistriesQuery();
    if (githubId) {
      req.andWhere(`"user"."githubId" ILIKE :githubId`, { githubId: `%${githubId}%` });
    }
    if (cityName) {
      req.andWhere(`"user"."cityName" ILIKE :cityName`, { cityName: `%${cityName}%` });
    }
    if (preselectedCourses?.length) {
      req.andWhere(
        `EXISTS (
          SELECT
          FROM unnest(string_to_array(mentorRegistry.preselectedCourses, ',')) course
          WHERE course = ANY(:preselectedCourses)
        )`,
        { preselectedCourses },
      );
    }
    if (preferedCourses?.length) {
      req.andWhere(
        `EXISTS (
        SELECT
        FROM unnest(string_to_array(mentorRegistry.preferedCourses, ',')) course
        WHERE course = ANY(:preferedCourses)
      )`,
        { preferedCourses },
      );
    }
    if (technicalMentoring?.length) {
      req.andWhere(
        `EXISTS (
        SELECT
        FROM unnest(string_to_array(mentorRegistry.technicalMentoring, ',')) course
        WHERE course = ANY(:technicalMentoring)
      )`,
        { technicalMentoring },
      );
    }

    const response = await paginate(req, {
      page,
      limit,
    });

    return {
      total: response.meta.total,
      mentors: response.items,
    };
  }
}
