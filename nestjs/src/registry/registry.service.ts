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
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { Course } from '@entities/course';
import { MentorRegistryTabsMode } from './registry.controller';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger('registry');

  constructor(
    @InjectRepository(MentorRegistry)
    private mentorsRegistryRepository: Repository<MentorRegistry>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(Registry)
    private registryRepository: Repository<Registry>,
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
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
    const req = this.getPreparedMentorRegistriesQuery().andWhere('mentorRegistry.canceled = false');

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
            qb.where(`string_to_array(mentorRegistry.preferedCourses, ',') && :coursesIds`, { coursesIds });
          }
          if (disciplineNames?.length) {
            qb.orWhere(
              `mentorRegistry.preferedCourses = ''
              OR string_to_array(mentorRegistry.technicalMentoring, ',') && :disciplineNames`,
              {
                disciplineNames,
              },
            );
          }
        }),
      );
    }
    if (status === MentorRegistryTabsMode.New) {
      req.andWhere(
        new Brackets(qb => {
          qb.where(`mentorRegistry.preselectedCourses = ''`).orWhere(
            `(SELECT COUNT(*) FROM mentor WHERE mentor.userId = mentorRegistry.userId AND mentor.courseId = ANY(string_to_array(mentorRegistry.preselectedCourses, ',')::int[]))
              < cardinality(string_to_array(mentorRegistry.preselectedCourses, ','))`,
          );
        }),
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

  public async createRegistration(
    authUser: { id: number; githubId: string },
    payload: { courseId: number; type: 'student' | 'mentor'; maxStudentsLimit?: number; experienceInYears?: string },
  ) {
    const { courseId, type, maxStudentsLimit, experienceInYears } = payload;

    if (!authUser.githubId || !courseId || !type) {
      throw new BadRequestException('Wrong payload: githubId courseId & type are required');
    }

    if (type === 'mentor' && (maxStudentsLimit == null || isNaN(maxStudentsLimit) || maxStudentsLimit < 2)) {
      throw new BadRequestException('Incorrect maxStudentsLimit');
    }

    const [user, course, existingRegistry] = await Promise.all([
      this.userRepository.findOne({ where: { githubId: authUser.githubId }, relations: ['mentors', 'students'] }),
      this.courseRepository.findOneBy({ id: Number(courseId) }),
      this.registryRepository.findOne({ where: { userId: authUser.id, courseId: Number(courseId) } }),
    ]);

    if (existingRegistry && existingRegistry.userId === authUser.id) {
      return existingRegistry;
    }

    let registryPayload: Partial<Registry> = {
      type,
      user: user!,
      course: course!,
      status: 'pending',
    };

    if (type === 'student') {
      registryPayload.status = 'approved';
      if ((user?.students || []).every(s => s.courseId !== courseId)) {
        await this.studentRepository.save({ userId: user!.id, courseId: course!.id, startDate: new Date() });
      }
    } else if (type === 'mentor') {
      registryPayload = {
        ...registryPayload,
        attributes: {
          maxStudentsLimit,
          experienceInYears,
        } as Registry['attributes'],
      };
      if ((user?.mentors || []).length > 0) {
        registryPayload.status = 'approved';
        await this.mentorRepository.save({ userId: user!.id, courseId: course!.id, maxStudentsLimit });
      }
    }

    return this.registryRepository.save(registryPayload);
  }
}
