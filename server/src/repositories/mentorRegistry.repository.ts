import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorRegistry } from '../models';
import { AvailableLanguages } from '../models/data';
import { userService } from '../services';

@EntityRepository(MentorRegistry)
export class MentorRegistryRepository extends AbstractRepository<MentorRegistry> {
  public async findAll() {
    const data = await this.getPreparedMentorRegistriesQuery().where('mentorRegistry.canceled = false').getMany();
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
      maxStudentsLimit,
      technicalMentoring,
      preferedStudentsLocation,
      preferedCourses,
      languagesMentoring = [],
    } = updateData;

    const mentorData: Partial<MentorRegistry> = {
      maxStudentsLimit,
      preferedStudentsLocation,
      englishMentoring: languagesMentoring.some(language => language === AvailableLanguages.EN),
      languagesMentoring,
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
    englishMentoring: mentorRegistry.englishMentoring,
    languagesMentoring: mentorRegistry.languagesMentoring,
    githubId: user.githubId,
    primaryEmail: user.primaryEmail,
    contactsEpamEmail: user.contactsEpamEmail,
    cityName: user.cityName,
    maxStudentsLimit: mentorRegistry.maxStudentsLimit,
    name: `${user.firstName} ${user.lastName}`,
    preferedCourses: mentorRegistry.preferedCourses?.map(id => Number(id)),
    preselectedCourses: mentorRegistry.preselectedCourses?.map(id => Number(id)),
    preferedStudentsLocation: mentorRegistry.preferedStudentsLocation,
    technicalMentoring: mentorRegistry.technicalMentoring,
    updatedDate: mentorRegistry.updatedDate,
    courses: mentorRegistry.user.mentors?.map(m => m.courseId),
    hasCertificate: mentorRegistry.user.students?.some(s => s.certificate?.id),
  };
}
