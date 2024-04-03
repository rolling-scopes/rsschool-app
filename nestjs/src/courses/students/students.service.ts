import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUser, Role, CourseRole } from '../../auth';
import { Repository } from 'typeorm';
import { StageInterview } from '@entities/index';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,

    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
  ) {}

  public getById(id: number) {
    return this.studentRepository.findOneOrFail({ where: { id }, relations: ['user'] });
  }

  public async canAccessStudent(user: AuthUser, studentId: number): Promise<boolean> {
    const student = await this.studentRepository.findOneBy({ id: studentId });
    const stageInterviews = await this.stageInterviewRepository.find({ where: { studentId } });
    if (student == null) {
      return false;
    }

    if (user.appRoles?.includes(Role.Admin)) {
      return true;
    }

    const { courseId } = student;
    const courseInfo = user.courses?.[courseId];
    const currentMentorId = user.courses?.[courseId]?.mentorId;

    if (courseInfo?.roles.includes(CourseRole.Manager)) {
      return true;
    }

    if (courseInfo?.roles.includes(CourseRole.Supervisor)) {
      return true;
    }

    if (stageInterviews.some(interview => interview.mentorId === currentMentorId)) {
      return true;
    }

    if (student.mentorId == null) {
      return false;
    }

    return student.mentorId === currentMentorId;
  }

  /*
   * sets mentor for student, when mentor accepts the student after technical screening
   */
  public async setMentor(studentId: number, mentorId: number) {
    await this.studentRepository.update(studentId, { mentorId });
  }
}
