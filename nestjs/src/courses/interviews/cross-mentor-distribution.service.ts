import { Injectable } from '@nestjs/common';
import { max } from 'lodash';
import { shuffleRec } from '../../utils';

export type CrossMentor = { id: number; students: { id: number }[] | null };

@Injectable()
export class CrossMentorDistributionService {
  public distribute(
    mentors: CrossMentor[],
    existingPairs: { studentId: number; mentorId: number }[],
    registeredStudentsIds?: number[],
    defaultMaxStudents = 1,
  ) {
    const initialMentorStudentsMap = mentors.reduce<Record<number, number[]>>((acc, m) => {
      acc[m.id] = (m.students ?? []).map(s => s.id);
      return acc;
    }, {});

    let students = mentors
      .map(m => m.students ?? [])
      .reduce((acc, v) => acc.concat(v), [] as { id: number }[])
      .filter(v => !existingPairs.find(p => p.studentId === v.id))
      .filter(v => registeredStudentsIds?.includes(v.id) ?? true);

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

    const randomStudents = shuffleRec(students);

    // distribute students to mentors by round-robin
    const maxStudentsMap = maxStudentsPerMentor.reduce(
      (acc, m) => {
        acc[m.id] = m.maxStudents;
        return acc;
      },
      {} as Record<number, number>,
    );

    if (registeredStudentsIds && randomStudents.length < maxStudentsTotal) {
      const filteredMentors = mentors.filter(m => (maxStudentsMap[m.id] ?? defaultMaxStudents) > 0);
      const maxStudentsPerMentorValue = max(filteredMentors.map(m => maxStudentsMap[m.id] ?? 0)) ?? 0;
      const mentorsQueue: number[] = [];
      for (let i = 0; i < maxStudentsPerMentorValue; i++) {
        filteredMentors.forEach((mentor, idx) => {
          if ((maxStudentsMap[mentor.id] ?? 0) > i) {
            mentorsQueue.push(idx);
          }
        });
      }
      mentorsQueue.reverse();

      // nullify students for mentors
      for (const mentor of mentors) {
        mentor.students = [];
      }

      const unassignedStudents: { id: number }[] = [];

      randomStudents.forEach(student => {
        let mentorIdx = mentorsQueue.pop();
        let assigned = false;

        while (mentorIdx != null) {
          const mentor = filteredMentors[mentorIdx];
          if (!mentor) {
            mentorIdx = mentorsQueue.pop();
            continue;
          }
          const wasAssignedToThisMentor = initialMentorStudentsMap[mentor.id]?.includes(student.id);
          if (!wasAssignedToThisMentor) {
            mentor.students = mentor.students ? mentor.students.concat([student]) : [student];
            assigned = true;
            break;
          }
          const nextMentorIdx = mentorsQueue.pop();
          mentorsQueue.unshift(mentorIdx);
          mentorIdx = nextMentorIdx;
        }

        if (!assigned) {
          unassignedStudents.push(student);
        }
      });

      return {
        mentors,
        unassignedStudents,
      };
    }

    for (const mentor of mentors) {
      const maxStudents = maxStudentsMap[mentor.id] ?? defaultMaxStudents;
      const mentorOriginalStudents = initialMentorStudentsMap[mentor.id] ?? [];
      const mentorStudents: { id: number }[] = [];
      for (let i = 0; i < randomStudents.length && mentorStudents.length < maxStudents; i++) {
        const student = randomStudents[i];
        if (student && !mentorOriginalStudents.includes(student.id)) {
          const spliced = randomStudents.splice(i, 1)[0];
          if (spliced) {
            mentorStudents.push(spliced);
          }
          i--;
        }
      }
      mentor.students = mentorStudents;
    }

    return {
      mentors,
      unassignedStudents: randomStudents,
    };
  }
}
