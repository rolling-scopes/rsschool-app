import moment from 'moment-timezone';
import { getCustomRepository, getRepository } from 'typeorm';
import { CourseTask, TaskChecker } from '../models';
import { MentorRepository } from '../repositories/mentor.repository';
import { CrossMentorDistributionService } from '../services/distribution';
import { InterviewRepository } from '../repositories/interview.repository';
import { ILogger } from '../logger';

export class InterviewService {
  private interviewRepository = getCustomRepository(InterviewRepository);
  private crossMentorService: CrossMentorDistributionService;

  constructor(
    private courseId: number,
    logger?: ILogger,
  ) {
    this.crossMentorService = new CrossMentorDistributionService(undefined, logger);
  }

  public async createInterviewsAutomatically(
    courseTaskId: number,
    options: { clean: boolean; registrationEnabled: boolean },
  ) {
    const courseTask = await getRepository(CourseTask).findOne({ where: { id: courseTaskId }, select: ['id'] });

    if (courseTask == null) {
      return null;
    }

    const mentorRepository = getCustomRepository(MentorRepository);
    const mentors = await mentorRepository.findActive(this.courseId, true);

    if (mentors.length === 0) {
      return [];
    }

    const checkerRepository = getRepository(TaskChecker);

    if (options.clean) {
      await checkerRepository.delete({ courseTaskId });
    }

    let registeredStudentsIds: number[] | undefined = undefined;
    if (options.registrationEnabled) {
      const student = await this.interviewRepository.findRegisteredStudents(this.courseId, courseTaskId);
      registeredStudentsIds = student.map(student => student.id);
    }

    const existingPairs = await checkerRepository.findBy({ courseTaskId });

    const { mentors: crossMentors } = this.crossMentorService.distribute(mentors, existingPairs, registeredStudentsIds);

    const taskCheckPairs = crossMentors
      .map(stm => stm.students?.map(s => ({ courseTaskId, mentorId: stm.id, studentId: s.id })) ?? [])
      .reduce((acc, student) => acc.concat(student), []);

    if (taskCheckPairs.length > 0) {
      await checkerRepository.insert(taskCheckPairs);
    }

    return taskCheckPairs;
  }

  public async cancelInterviewPair(pairId: number) {
    return this.interviewRepository.cancelById(pairId);
  }

  public async createInterview(courseTaskId: number, interviewerGithubId: string, studentGithubId: string) {
    return this.interviewRepository.addPair(this.courseId, courseTaskId, interviewerGithubId, studentGithubId);
  }

  public async isInterviewStarted(courseTaskId: number) {
    const courseTask = await getRepository(CourseTask).findOne({
      where: { id: courseTaskId },
      select: ['studentStartDate'],
    });
    return moment(courseTask?.studentStartDate).isBefore(moment());
  }
}
