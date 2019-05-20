import { User, Student, Mentor } from '../models';
import { getRepository } from 'typeorm';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
  mentorId: number | null;
  taskResults: {
    id: number;
    courseTaskId: number;
    score: number;
  }[];
};

export async function getCourseStudent(courseId: number, userId: number) {
  return getRepository(Student)
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
    taskResults: (student.taskResults || []).map(taskResult => ({
      id: taskResult.id,
      courseTaskId: taskResult.courseTaskId,
      score: taskResult.score,
    })),
    isExpelled: student.isExpelled,
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
    taskResults: (student.taskResults || []).map(taskResult => ({
      id: taskResult.id,
      courseTaskId: taskResult.courseTaskId,
      score: taskResult.score,
    })),
    isExpelled: student.isExpelled,
  }));
}
