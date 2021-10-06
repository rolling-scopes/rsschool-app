import { getCustomRepository } from 'typeorm';
import { Resume } from '../models';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { ResumeRepository } from '../repositories/resume.repository';
import { StudentRepository } from '../repositories/student.repository';

export class ApplicantService {
  private resumeRepository = getCustomRepository(ResumeRepository);
  private feedbackRespository = getCustomRepository(FeedbackRepository);
  private studentRepository = getCustomRepository(StudentRepository);

  public async getApplicants(visibleOnly: boolean) {
    const profiles = await this.resumeRepository.findActive(visibleOnly);

    const data = await Promise.all(
      profiles.map(async (cv: Resume) => {
        const { githubId } = cv;

        const [feedback, courses] = await Promise.all([
          this.feedbackRespository.getApplicantFeedback(githubId),
          this.studentRepository.findAndIncludeStatsForResume(githubId),
        ]);

        const realCourses = courses.filter(course => course.courseFullName !== 'TEST COURSE');

        return {
          ...cv,
          feedback,
          courses: realCourses,
        };
      }),
    );

    return data;
  }
}
