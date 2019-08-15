import { User, Student } from '../models';
import { getRepository } from 'typeorm';

export async function getCourseStudent(courseId: number, userId: number) {
  return getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('user.id = :userId AND course.id = :courseId', { userId, courseId })
    .getOne();
}

export async function getCourseStudentByGithubId(githubId: string) {
  return getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('user.githubId = :githubId', { githubId })
    .getOne();
}

export async function getExternalAccounts(courseId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('course.id = :courseId', { courseId })
    .getMany();

  return students.map(student => ({
    externalAccounts: (student.user as User).externalAccounts,
    githubId: (student.user as User).githubId,
    studentId: student.id,
    userId: (student.user as User).id,
  }));
}
