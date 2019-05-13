import { User, Student, Mentor } from '../models';
import { getRepository } from 'typeorm';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
  mentorId: number | null;
  taskResults: {
    courseTaskId: number;
    createdDate: string;
    updatedDate: string;
    githubPrUrl: string | null;
    githubRepoUrl: string | null;
    score: number;
    comment?: string;
  }[];
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
    mentorId: null,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
    taskResults: [],
  }));
}

export async function getCourseStudentsWithTasks(courseId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .leftJoinAndSelect('student.mentor', 'mentor')
    .leftJoinAndSelect('student.taskResults', 'taskResults')
    .innerJoinAndSelect('student.course', 'course')
    .where('course.id = :courseId', { courseId })
    .getMany();

  return students.map<StudentDTO>(student => ({
    studentId: student.id,
    mentorId: student.mentor != null ? (student.mentor as Mentor).id : null,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
    taskResults: student.taskResults || [],
  }));
}

export async function getMentorStudents(mentorId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.taskResults', 'taskResults')
    .innerJoinAndSelect('student.user', 'user')
    .where('"student"."mentorId" = :mentorId', { mentorId })
    .getMany();

  return students.map<StudentDTO>(student => ({
    studentId: student.id,
    mentorId,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
    taskResults: student.taskResults || [],
  }));
}
