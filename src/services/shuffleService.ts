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

export const shuffleCourseMentors = (_: ILogger) => async (courseId: number) => {
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
  const studentRestrictions = mentors.map(v => (v.students || []).length);
  const randomStudents = shuffleArray(students);

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < studentRestrictions.length; i++) {
    const maxStudents = studentRestrictions[i];

    const students = randomStudents.splice(maxStudents);
    mentors[i].students = students;
  }

  return mentors;
};
