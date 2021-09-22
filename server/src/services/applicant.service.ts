import { Resume } from '../models';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { ResumeRepository } from '../repositories/resume';
import { StudentRepository } from '../repositories/student.repository';

export class ApplicantService {
  private resumeRepository = new ResumeRepository();
  private feedbackRespository = new FeedbackRepository();
  private studentRepository = new StudentRepository();

  public async getApplicants(visibleOnly: boolean) {
    const profiles = await this.resumeRepository.findActive(visibleOnly);

    const data = await Promise.all(
      profiles.map(async (cv: Resume) => {
        const { githubId } = cv;

        const [feedback, courses] = await Promise.all([
          this.feedbackRespository.getApplicantFeedback(githubId),
          this.studentRepository.findAndIncludeStatsForResume(githubId),
        ]);

        return {
          ...cv,
          feedback,
          courses,
        };
      }),
    );

    return data;
  }
}
