import { getCustomRepository, getRepository } from 'typeorm';
import { userService } from './index';
import { MentorRepository } from '../repositories/mentor';
import { StudentRepository } from '../repositories/student';
import { createMentorStudentPairs } from '../rules/mentors';
import { OperationResult } from './operationResult';
import { Mentor } from '../models';
import { ILogger } from '../logger';

export class MentorService {
  private studentRepository = getCustomRepository(StudentRepository);
  private mentorRepository = getCustomRepository(MentorRepository);

  constructor(private courseId: number, private logger: ILogger) {}

  public async assignStudentsRandomly() {
    const students = await this.studentRepository.findActiveByCourseId(this.courseId);
    const mentors = await this.mentorRepository.findActiveWithStudentsLimit(this.courseId);
    const pairs = createMentorStudentPairs(mentors, students);

    this.logger.info(`Students: ${students.length}; Mentors: ${mentors.length}; Pairs: ${pairs.length}`);

    await this.studentRepository.setMentorsBatch(pairs);
  }

  public async createMentors(data: { githubId: string; maxStudentsLimit: number }[]): Promise<OperationResult[]> {
    const result: OperationResult[] = [];
    for (const item of data) {
      const { githubId, maxStudentsLimit } = item;

      const user = await userService.getUserByGithubId(item.githubId);

      if (user == null) {
        result.push({ status: 'skipped', value: githubId });
        continue;
      }

      const current = await this.mentorRepository.findByGithubId(this.courseId, githubId);

      if (current) {
        result.push({ status: 'skipped', value: item.githubId });
        continue;
      }

      const mentor: Partial<Mentor> = { userId: user.id, maxStudentsLimit, courseId: this.courseId };
      const savedMentor = await getRepository(Mentor).save(mentor);

      result.push({ status: 'created', value: savedMentor.id });
    }
    return result;
  }
}
