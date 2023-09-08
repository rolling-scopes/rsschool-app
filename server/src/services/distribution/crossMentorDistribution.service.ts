/* eslint-disable no-console */
import { max } from 'lodash';
import { ILogger } from '../../logger';
import { shuffleRec } from './shuffle';

export type CrossMentor = { id: number; students: { id: number }[] | null };

export class CrossMentorDistributionService {
  constructor(
    private defaultMaxStudents = 1,
    private logger?: ILogger,
  ) {}

  public distribute(
    mentors: CrossMentor[],
    existingPairs: { studentId: number; mentorId: number }[],
    registeredStudentsIds?: number[],
  ) {
    let students = mentors
      .map(m => m.students ?? [])
      .reduce((acc, v) => acc.concat(v), [] as { id: number }[])
      .filter(v => !existingPairs.find(p => p.studentId === v.id))
      .filter(v => registeredStudentsIds?.includes(v.id) ?? true);

    this.logger?.info(`Initial students: ${students.length}`);

    const maxStudentsPerMentor = mentors.map(({ id, students }) => {
      const assignedCount = existingPairs.filter(p => p.mentorId === id).length;
      const maxStudentsCount = Math.max((students?.length ?? 0) - assignedCount, 0);
      return { id, maxStudents: maxStudentsCount };
    });

    const maxStudentsTotal = maxStudentsPerMentor.reduce((acc, m) => acc + m.maxStudents, 0);

    if (students.length < maxStudentsTotal && registeredStudentsIds) {
      students = students.concat(
        registeredStudentsIds
          .filter(id => !existingPairs.find(p => p.studentId === id) && !students.find(st => st.id === id))
          .slice(0, maxStudentsTotal - students.length)
          .map(id => ({ id })),
      );
    }

    const randomStudents = students.length > 1 ? shuffleRec(students) : students;

    // distribute students to mentors by round robin
    const maxStudentsMap = maxStudentsPerMentor.reduce(
      (acc, m) => {
        acc[m.id] = m.maxStudents;
        return acc;
      },
      {} as Record<number, number>,
    );

    this.logger?.info(`Registered Students ${registeredStudentsIds?.length}. Max Students: ${maxStudentsTotal}`);
    this.logger?.info(`Selected Students: ${randomStudents.length}`);
    this.logger?.info(`Mentors Count: ${mentors.length}`);

    if (registeredStudentsIds && randomStudents.length < maxStudentsTotal) {
      const filteredMentors = mentors.filter(m => (maxStudentsMap[m.id] ?? this.defaultMaxStudents) > 0);
      const maxStudentsPerMentor = max(filteredMentors.map(m => maxStudentsMap[m.id] ?? 0)) ?? 0;
      const mentorsQueue: number[] = [];
      for (let i = 0; i < maxStudentsPerMentor; i++) {
        filteredMentors.forEach((mentor, idx) => {
          const student = mentor.students?.[i];
          if (student) {
            mentorsQueue.push(idx);
          }
        });
      }
      mentorsQueue.reverse();

      // nullify students for mentors
      for (const mentor of mentors) {
        mentor.students = [];
      }
      randomStudents.forEach(student => {
        const mentorIdx = mentorsQueue.pop();
        if (mentorIdx == null) return;
        const mentor = filteredMentors[mentorIdx];
        mentor.students = mentor.students ? mentor.students.concat([student]) : [student];
      });
    } else {
      for (const mentor of mentors) {
        const maxStudents = maxStudentsMap[mentor.id] ?? this.defaultMaxStudents;
        const students = randomStudents.splice(0, maxStudents);
        mentor.students = students;
      }
    }

    const distributedStudents = mentors.reduce((acc, m) => acc.concat(m.students ?? []), [] as { id: number }[]);
    const mentorsWithStudents = mentors.filter(m => (m.students?.length ?? 0) > 0);
    this.logger?.info(`Distributed students: ${distributedStudents.length}`);
    this.logger?.info(`Mentors with students: ${mentorsWithStudents.length}`);

    return {
      mentors,
      unassignedStudents: randomStudents,
    };
  }
}
