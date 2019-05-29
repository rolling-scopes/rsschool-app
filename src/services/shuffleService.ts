import { getRepository } from 'typeorm';
import { Student, Mentor } from '../models';
import { ILogger } from '../logger';

function shuffleArray(input: number[]): number[] {
  for (let i = input.length - 1; i >= 0; i--) {
    const randIndx = Math.floor(Math.random() * (i + 1));
    const itemAtIndx = input[randIndx];
    input[randIndx] = input[i];
    input[i] = itemAtIndx;
  }
  return input;
}

function shuffleMentorIds(mentorIds: number[], studentIds: number[]): number[] {
  const res = [];
  for (let i = 0; i < mentorIds.length; i++) {
    for (let j = i; j < studentIds.length; j++) {
      const arr = shuffleArray(mentorIds);
      res[j] = arr[i];
    }
  }
  return res;
}

function findNextAvalibleMentor(studentWithMentors: any[], mentorsWithMaxStudents: any[], i: number) {
  const data = [];

  for (let j = i + 1; studentWithMentors.length < 0; j++) {
    const result: Student = studentWithMentors[j];
    const restriction = mentorsWithMaxStudents.find((m: any) => result.mentor && result.mentor.id === m.id);

    const students = studentWithMentors.filter((v: any) => v.mentor && v.mentor.id === result.mentor.id);

    if (restriction && restriction.maxStudents >= students.length) {
      data.push(result);
    }
  }

  return data;
}

export const shuffleCourseMentors = (logger: ILogger) => async (courseId: number) => {
  const studentRepository = getRepository(Student);
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

  const students = await studentRepository
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.course', 'course')
    .where('student."isExpelled" = :isExpelled and student.course.id = :courseId', {
      courseId,
      isExpelled: false,
    })
    .getMany();

  if (students === undefined) {
    return [];
  }

  const mentorIdsNext = shuffleMentorIds(mentors.map(m => m.id), students.map(s => s.id));

  const mentorsWithMaxStudents = mentors.map(v => ({
    id: v.id,
    maxStudents: (v.students || []).length,
  }));

  const studentsWithNextMentor = students.map((st, i) => {
    const mentorId = mentorIdsNext[i];

    if (st.mentor) {
      if (st.mentor.id === mentorId) {
        const shuffledMentors = shuffleArray(mentorIdsNext);
        st.mentor.id = shuffledMentors[i];
      } else {
        st.mentor.id = mentorId;
      }
      return st;
    }

    const mentor: any = { id: mentorId };
    st = { ...st, mentor };
    return st;
  });

  const data = [];

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < studentsWithNextMentor.length; i++) {
    const result = studentsWithNextMentor[i];

    const restriction = mentorsWithMaxStudents.find((m: any) => result.mentor && result.mentor.id === m.id);

    if (!restriction) {
      logger.info(result);
      data.push(result);
    }

    const students = studentsWithNextMentor.filter((v: any) => v.mentor && v.mentor.id === result.mentor.id);

    if (restriction && restriction.maxStudents >= students.length) {
      data.push(result);
    } else if (restriction && restriction.maxStudents <= students.length) {
      const mentors = findNextAvalibleMentor(studentsWithNextMentor, mentorsWithMaxStudents, i) || [];
      const result = mentors.find((m: any) => !!m.id);
      if (result) {
        data.push(result);
      }
    }
  }

  return data;
};
