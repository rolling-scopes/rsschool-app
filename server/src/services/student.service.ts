import * as courseService from './course.service';
import { IUserSession } from '../models';
import { getCustomRepository } from 'typeorm';
import { StageInterviewRepository } from '../repositories/stageInterview';
import { StudentRepository } from '../repositories/student';

export async function canChangeStatus(
  session: IUserSession,
  courseId: number,
  githubId: string,
): Promise<{ allow: boolean; message?: string }> {
  const student = await courseService.getStudentByGithubId(courseId, githubId);
  if (student == null) {
    return {
      allow: false,
      message: 'not valid student',
    };
  }
  if (courseService.isPowerUser(courseId, session)) {
    return { allow: true };
  }
  if (!courseService.isPowerUser(courseId, session)) {
    const repository = getCustomRepository(StageInterviewRepository);
    const [interviews, mentor] = await Promise.all([
      repository.findByStudent(courseId, githubId),
      courseService.getCourseMentor(courseId, session.id),
    ] as const);
    if (mentor == null) {
      return {
        allow: false,
        message: 'not valid mentor',
      };
    }
    if (!interviews.some((it) => it.interviewer.githubId === session.githubId) && student.mentorId !== mentor.id) {
      return {
        allow: false,
        message: 'incorrect mentor-student relation',
      };
    }
  }
  return { allow: true };
}

export async function updateRepositoryActivity(repositoryUrl: string) {
  await getCustomRepository(StudentRepository).updateRepositoryActivityDate(repositoryUrl);
}
