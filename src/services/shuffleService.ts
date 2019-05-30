import { getRepository } from 'typeorm';
import { Mentor } from '../models';
import { ILogger } from '../logger';

function shuffleArray(input: any[]): any[] {
  for (let i = input.length - 1; i >= 0; i--) {
    const randIndx = Math.floor(Math.random() * (i + 1));
    const itemAtIndx = input[randIndx];
    input[randIndx] = input[i];
    input[i] = itemAtIndx;
  }
  return input;
}

export const shuffleCourseMentors = (logger: ILogger) => async (courseId: number) => {
  const mentorRepository = getRepository(Mentor);

  const mentors = await mentorRepository
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.course', 'course')
    .innerJoinAndSelect('mentor.students', 'students')
    .where('mentor.course.id = :courseId', {
      courseId,
    })
    .getMany();

  if (mentors === undefined) {
    return [];
  }

  const students = mentors.map(m => m.students).reduce((acc: any, v) => acc.concat(v), []);
  const notExpeledStudents = students.filter((std: any) => Boolean(std.isExpelled) === false);

  const studentRestrictions = mentors.map(v => ({
    id: v.id,
    maxStudents: (v.students || []).filter((std: any) => Boolean(std.isExpelled) === false).length,
  }));

  const randomStudents = shuffleArray(notExpeledStudents);

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < mentors.length; i++) {
    const d = studentRestrictions.find(str => str.id === mentors[i].id) || { maxStudents: 1 };
    const students = randomStudents.splice(0, d.maxStudents);

    mentors[i].students = students;
  }

  logger.info(`${randomStudents.length}`);

  return mentors;
};
