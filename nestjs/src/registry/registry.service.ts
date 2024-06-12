import { User } from '@entities/user';
import { MentorRegistry } from '@entities/mentorRegistry';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { InviteMentorsDto } from './dto/invite-mentors.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Student } from '@entities/student';

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
