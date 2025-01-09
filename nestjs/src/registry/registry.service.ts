import { User } from '@entities/user';
import { MentorRegistry } from '@entities/mentorRegistry';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { Brackets, Repository } from 'typeorm';
import { paginate } from 'src/core/paginate';
import { InviteMentorsDto } from './dto/invite-mentors.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Student } from '@entities/student';
import { MentorRegistryTabsMode } from './registry.controller';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger('registry');

  constructor(
    @InjectRepository(MentorRegistry)
    private mentorsRegistryRepository: Repository<MentorRegistry>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    private usersService: UsersService,
    private coursesService: CoursesService,
    private notificationsService: NotificationsService,
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
    coursesIds,
    disciplineNames,
    status,
  }: {
    githubId?: string;
    cityName?: string;
    page: number;
    limit: number;
    preselectedCourses?: number[];
    preferedCourses?: number[];
    technicalMentoring?: string[];
    coursesIds?: number[];
    disciplineNames?: string[];
    status: MentorRegistryTabsMode;
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

    if (coursesIds?.length || disciplineNames?.length) {
      req.andWhere(
        new Brackets(qb => {
          if (coursesIds?.length) {
            qb.where(`string_to_array(mentorRegistry.preferedCourses, ',') && :coursesIds`, { coursesIds }).andWhere(
              'mentorRegistry.canceled = false',
            );
          }
          if (disciplineNames?.length) {
            qb.orWhere(`string_to_array(mentorRegistry.technicalMentoring, ',') && :disciplineNames`, {
              disciplineNames,
            }).andWhere('mentorRegistry.canceled = false');
          }
        }),
      );
    }
    if (status === MentorRegistryTabsMode.New) {
      req.andWhere('mentorRegistry.preselectedCourses != mentorRegistry.preferedCourses');
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

  public async sendInvitationsToMentors(data: InviteMentorsDto) {
    const { text, disciplines, isMentor } = data;

    const query = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.course', 'course')
      .innerJoin('course.discipline', 'discipline')
      .innerJoin(
        'notification_user_connection',
        'notification',
        'notification.userId = student.userId and notification.channelId = :channelId and notification.enabled = :enabled',
        {
          channelId: 'email',
          enabled: true,
        },
      )
      .innerJoin('student.certificate', 'certificate')
      .where('discipline.id IN (:...ids)', { ids: disciplines })
      .select(['student.userId', 'notification.externalId'])
      .distinct(true);

    if (isMentor) {
      query.innerJoin('mentor', 'mentor', 'mentor.userId = student.userId');
    }

    const users = await query.getRawMany();

    Promise.resolve().then(
      () =>
        // eslint-disable-next-line no-async-promise-executor
        new Promise(async () => {
          this.logger.log({ message: 'processing invitations...' });

          const batchSize = 10;

          for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);

            const promises = batch.map(async user => {
              const userId = user.student_userId;
              const email = user.notification_externalId;

              try {
                await this.notificationsService.sendMessage({
                  notificationId: 'mentorsInvitation',
                  userId,
                  data: {
                    text,
                  },
                  channelId: 'email',
                  channelValue: email,
                  noEscape: true,
                });
              } catch (e) {
                this.logger.log({ message: (e as Error).message, userId });
              }
            });

            await Promise.all(promises);
          }
        }),
    );
  }
}
