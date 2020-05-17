import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorRegistry } from '../models';

@EntityRepository(MentorRegistry)
export class MentorRegistryRepository extends AbstractRepository<MentorRegistry> {
  public async findAllMentorRegistries() {
    const data = await this.getPreparedMentorRegistriesQuery().getMany();
    return data.map(transformMentorRegistry);
  }

  public async findMentorRegistriesByCoursesIds(coursesIds: Array<any>) {
    const data = await this.getPreparedMentorRegistriesQuery()
      .where('mentorRegistry.preferedCourses IN (:...ids)', { ids: coursesIds })
      .getMany();
    return data.map(transformMentorRegistry);
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
    preferedCourses: mentorRegistry.preferedCourses?.map(id => Number(id)),
    preselectedCourses: mentorRegistry.preselectedCourses?.map(id => Number(id)),
    preferedStudentsLocation: mentorRegistry.preferedStudentsLocation,
    technicalMentoring: mentorRegistry.technicalMentoring,
    updatedDate: mentorRegistry.updatedDate,
    courses: mentorRegistry.user.mentors?.map(m => m.courseId),
    hasCertificate: mentorRegistry.user.students?.some(s => s.certificate?.id),
  };
}
