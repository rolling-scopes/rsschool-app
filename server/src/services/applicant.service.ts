import { getCustomRepository } from 'typeorm';
import { Resume } from '../models';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { ResumeRepository } from '../repositories/resume.repository';
import { StudentRepository } from '../repositories/student.repository';
import omit from 'lodash/omit';

export class ApplicantService {
  private resumeRepository = getCustomRepository(ResumeRepository);
  private feedbackRespository = getCustomRepository(FeedbackRepository);
  private studentRepository = getCustomRepository(StudentRepository);

  public async getApplicants(visibleOnly: boolean) {
    const profiles = await this.resumeRepository.findActive(visibleOnly);

    const data = await Promise.all(
      profiles.map(async (resume: Resume) => {
        const { githubId } = resume;

        const [feedback, courses] = await Promise.all([
          this.feedbackRespository.getApplicantFeedback(githubId),
          this.studentRepository.findAndIncludeStatsForResume(githubId),
        ]);

        const selectedCourses = courses
          .filter(course => course.courseFullName !== 'TEST COURSE' && resume?.visibleCourses.includes(course.courseId))
          .map(course => omit(course, ['courseId']));

        return {
          ...omit(resume, ['visibleCourses']),
          feedback,
          courses: selectedCourses,
        };
      }),
    );

    return data;
  }
}
