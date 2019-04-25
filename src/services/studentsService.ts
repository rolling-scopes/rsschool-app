import { User, Student } from '../models';
import { getRepository } from 'typeorm';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
};

export async function getCourseStudent(courseId: number, userId: number) {
  return await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('user.id = :userId AND course.id = :courseId', { userId, courseId })
    .getOne();
}

export async function getCourseStudents(courseId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('course.id = :courseId', { courseId })
    .getMany();

  return students.map<StudentDTO>(student => ({
    studentId: student.id,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
  }));
}

export async function getMentorStudents(mentorId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .where('"student"."mentorId" = :mentorId', { mentorId })
    .getMany();

  return students.map<StudentDTO>(student => ({
    studentId: student.id,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
  }));
}
