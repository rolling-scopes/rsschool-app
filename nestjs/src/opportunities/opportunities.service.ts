import { In, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { Student } from '@entities/student';
import { ResumeDto } from './dto/resume.dto';

const EXPIRATION_DAYS_PROLONGATION = 30;

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
    if (resume == null) return null;
    return await this.getFullResume(resume, false);
  }

  public async saveResume(githubId: string, resumeDto: ResumeDto): Promise<ResumeDto | null> {
    const resume = await this.resumeRepository.findOneBy({ githubId });
    if (resume == null) return null;
    return await this.resumeRepository.save({ ...resume, ...resumeDto });
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

  public async updateStatus(githubId: string) {
    const resume = await this.resumeRepository.findOneBy({ githubId });
    const expirationTimestamp = DateTime.local().plus({ days: EXPIRATION_DAYS_PROLONGATION }).valueOf();
    const result = await this.resumeRepository.save({ id: resume?.id, githubId, expires: expirationTimestamp });
    return result.expires;
  }

  public async setVisibility(githubId: string, isVisible: boolean) {
    const resume = await this.resumeRepository.findOneBy({ githubId });
    const isHidden = !isVisible;
    const savedResume = await this.resumeRepository.save({ id: resume?.id, githubId, isHidden });
    return savedResume.isHidden;
  }

  public async getConsent(githubId: string) {
    const user = await this.userRepository.findOne({ where: { githubId } });
    if (user == null) return false;
    const value = user.opportunitiesConsent;
    return Boolean(value);
  }

  public async createConsent(githubId: string) {
    const value = true;
    const user = await this.userRepository.findOneOrFail({ where: { githubId } });
    await this.userRepository.update(user.id, { opportunitiesConsent: value });
    const current = await this.resumeRepository.findOneBy({ githubId });
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

  private async getFullResume(resume: Resume, visibleCourseOnly = true): Promise<ResumeData> {
    const [students, gratitudes] = await Promise.all([
      resume.userId
        ? this.studentRepository.find({
            relations: ['course', 'certificate', 'mentor', 'mentor.user'],
            where: {
              userId: resume.userId,
              // if visibleCourses is not defined, then we show info from all courses
              ...(visibleCourseOnly && resume.visibleCourses.length ? { courseId: In(resume.visibleCourses) } : {}),
            },
          })
        : Promise.resolve([]),
      resume.userId
        ? this.feedbackRepository.find({ where: { toUserId: resume.userId }, order: { createdDate: 'DESC' } })
        : Promise.resolve([]),
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
