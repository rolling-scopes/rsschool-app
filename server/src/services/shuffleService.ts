import { getRepository } from 'typeorm';
import { Mentor } from '../models';
import { ILogger } from '../logger';
import { shuffleRec } from '../lib/distribution';

const defaultStudentRestrictions = { maxStudents: 1 };

export const shuffleCourseMentors = (logger: ILogger) => async (courseId: number) => {
  const mentorRepository = getRepository(Mentor);

  const mentors = await mentorRepository
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.students', 'students')
    .where('mentor."courseId" = :courseId', { courseId })
    .getMany();

  if (mentors === undefined) {
    return [];
  }

  const students = mentors
    .map(m => m.students)
    .reduce((acc: any, v) => acc.concat(v), [])
    .filter((std: any) => Boolean(std.isExpelled) === false);

  const nextStudents = shuffleRec(students);

  const studentRestrictions = mentors.map(v => ({
    id: v.id,
    maxStudents: (v.students || []).filter((std: any) => Boolean(std.isExpelled) === false).length,
  }));
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < mentors.length; i++) {
    const d = studentRestrictions.find(str => str.id === mentors[i].id) || defaultStudentRestrictions;
    const students = nextStudents.splice(0, d.maxStudents);
    mentors[i].students = students;
  }

  logger.info(`${nextStudents.length}`);

  return mentors;
};
