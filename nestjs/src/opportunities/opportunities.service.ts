import { User } from '@entities/user';
import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from '@entities/student';

type ResumeData = {
  resume: Resume;
  students: Student[];
  gratitudes: Feedback[];
  feedbacks: StudentFeedback[];
};

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(StudentFeedback)
    private studentFeedbackRepository: Repository<StudentFeedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  public async getResumeByUuid(uuid: string): Promise<ResumeData | null> {
    const resume = await this.resumeRepository.findOneOrFail({ where: { uuid } });
    return await this.getFullResume(resume);
  }

  public async getResumeByGithubId(githubId: string): Promise<ResumeData | null> {
    const user = await this.userRepository.findOneOrFail({ where: { githubId } });
    const resume = await this.resumeRepository.findOne({ where: { userId: user.id } });
    if (resume == null) {
      return null;
    }
    return await this.getFullResume(resume);
  }

  public async getApplicantResumes(): Promise<Resume[]> {
    const resume = await this.resumeRepository
      .createQueryBuilder('r')
      .innerJoin('r.user', 'u')
      .where('u."opportunitiesConsent" = true')
      .andWhere('r.name IS NOT NULL')
      .addSelect(['u.id', 'u.githubId'])
      .getMany();

    return resume;
  }

  public async getConsent(githubId: string) {
    const user = await this.userRepository.findOne({ where: { githubId } });
    if (user == null) {
      return false;
    }
    const value = user.opportunitiesConsent;
    return Boolean(value);
  }

  public async createConsent(githubId: string) {
    const value = true;
    const user = await this.userRepository.findOneOrFail({ where: { githubId } });
    await this.userRepository.update(user.id, { opportunitiesConsent: value });
    const current = await this.resumeRepository.findOne({ githubId });
    await this.resumeRepository.save({ id: current?.id, githubId, userId: user.id });
    return Boolean(value);
  }

  public async deleteConsent(githubId: string) {
    const value = false;
    const user = await this.userRepository.findOneOrFail({ where: { githubId } });
    await this.userRepository.update(user.id, { opportunitiesConsent: value });
    await this.resumeRepository.delete({ githubId });
    return Boolean(value);
  }

  private async getFullResume(resume: Resume) {
    const [students, gratitudes] = await Promise.all([
      this.studentRepository.find({
        relations: ['course', 'certificate', 'mentor', 'mentor.user'],
        where: {
          userId: resume.userId,
          courseId: In(resume.visibleCourses ?? []),
        },
      }),
      this.feedbackRepository.find({ where: { toUserId: resume.userId }, order: { createdDate: 'DESC' } }),
    ]);

    const feedbacks = await this.studentFeedbackRepository.find({
      relations: ['student', 'student.course', 'mentor', 'mentor.user'],
      where: { studentId: In(students.map(s => s.id)), recommendation: Recommendation.Hire },
    });

    return {
      resume,
      students,
      gratitudes,
      feedbacks,
    };
  }
}
