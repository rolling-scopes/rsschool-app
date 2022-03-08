import { User } from '@entities/user';
import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { StudentFeedback } from '@entities/student-feedback';
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
    const resume = await this.resumeRepository.findOne({ where: { uuid } });
    return await this.getFullResume(resume);
  }

  public async getResumeByGithubId(githubId: string): Promise<ResumeData | null> {
    const user = await this.userRepository.findOne({ where: { githubId } });
    const resume = await this.resumeRepository.findOne({ where: { userId: user.id } });
    console.log(resume, user.id);
    if (resume == null) {
      return null;
    }
    return await this.getFullResume(resume);
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
      this.feedbackRepository.find({ where: { toUserId: resume.userId } }),
    ]);

    const feedbacks = await this.studentFeedbackRepository.find({
      relations: ['student', 'student.course', 'mentor', 'mentor.user'],
      where: { studentId: In(students.map(s => s.id)) },
    });

    return {
      resume,
      students,
      gratitudes,
      feedbacks,
    };
  }
}
