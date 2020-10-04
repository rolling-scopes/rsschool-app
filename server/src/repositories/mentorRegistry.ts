import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorRegistry } from '../models';
import { userService } from '../services';

@EntityRepository(MentorRegistry)
export class MentorRegistryRepository extends AbstractRepository<MentorRegistry> {
  public async findAll() {
    const data = await this.getPreparedMentorRegistriesQuery().where('mentorRegistry.canceled = false').getMany();
    return data.map(transformMentorRegistry);
  }

  public async findByCoursesIds(coursesIds: Array<any>) {
    const data = await this.getPreparedMentorRegistriesQuery()
      .where('mentorRegistry.preferedCourses IN (:...ids)', { ids: coursesIds })
      .getMany();
    return data.map(transformMentorRegistry);
  }

  public async cancel(githubId: string) {
    const user = await userService.getUserByGithubId(githubId);
    if (user == null) {
      return;
    }
    await getRepository(MentorRegistry).update({ userId: user.id }, { canceled: true });
  }

  public async register(githubId: string, updateData: Partial<MentorRegistry>) {
    const user = await userService.getUserByGithubId(githubId);

    if (user == null) {
      return;
    }
    const {
      comment,
      maxStudentsLimit,
      technicalMentoring,
      preferedStudentsLocation,
      preferedCourses,
      englishMentoring,
    } = updateData;

    const mentorData: Partial<MentorRegistry> = {
      comment,
      maxStudentsLimit,
      preferedStudentsLocation,
      englishMentoring,
      preferedCourses,
      technicalMentoring,
      canceled: false,
    };

    const mentorRegistry = await getRepository(MentorRegistry).findOne({ where: { userId: user.id } });
    if (mentorRegistry == null) {
      await getRepository(MentorRegistry).insert({ userId: user.id, ...mentorData });
    } else {
      await getRepository(MentorRegistry).update(mentorRegistry.id, { ...mentorData, preselectedCourses: [] });
    }
  }

  public async update(githubId: string, updateData: { preselectedCourses: string[] }) {
    const data: Partial<MentorRegistry> = updateData;
    const user = await userService.getUserByGithubId(githubId);
    if (user == null) {
      return;
    }
    await getRepository(MentorRegistry).update({ userId: user.id }, data);
  }

  private getPreparedMentorRegistriesQuery() {
    return getRepository(MentorRegistry)
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
}

function transformMentorRegistry(mentorRegistry: MentorRegistry) {
  const user = mentorRegistry.user;
  return {
    id: mentorRegistry.id,
    comment: mentorRegistry.comment,
    englishMentoring: mentorRegistry.englishMentoring,
    githubId: user.githubId,
    primaryEmail: user.primaryEmail,
    contactsEpamEmail: user.contactsEpamEmail,
    cityName: user.cityName,
    maxStudentsLimit: mentorRegistry.maxStudentsLimit,
    name: `${user.firstName} ${user.lastName}`,
    preferedCourses: mentorRegistry.preferedCourses?.map((id) => Number(id)),
    preselectedCourses: mentorRegistry.preselectedCourses?.map((id) => Number(id)),
    preferedStudentsLocation: mentorRegistry.preferedStudentsLocation,
    technicalMentoring: mentorRegistry.technicalMentoring,
    updatedDate: mentorRegistry.updatedDate,
    courses: mentorRegistry.user.mentors?.map((m) => m.courseId),
    hasCertificate: mentorRegistry.user.students?.some((s) => s.certificate?.id),
  };
}
