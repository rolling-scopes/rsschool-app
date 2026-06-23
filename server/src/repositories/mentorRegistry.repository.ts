import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorRegistry } from '../models';
import { AvailableLanguages } from '../models/data';
import { userService } from '../services';

@EntityRepository(MentorRegistry)
export class MentorRegistryRepository extends AbstractRepository<MentorRegistry> {
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
}
