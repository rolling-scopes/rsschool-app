import { pick, random, shuffle, sum, sumBy } from 'lodash';
import { MentorDetails } from '../services/course.service';

type Mentor = {
  id: number;
  capacity: number;
};

type MentorInput = Pick<MentorDetails, 'id' | 'maxStudentsLimit' | 'students'>;

type Student = {
  id: number;
  totalScore: number;
  mentor: { id: number } | null;
};

export function createMentorStudentPairs(allMentors: MentorInput[], allStudents: Student[]) {
  // filter students who has interview already
  const availableStudents = allStudents.filter(s => s.mentor?.id == null);

  // create pairs if student already has mentor
  let distibution = allMentors
    .filter(m => m.students.length)
    .map(m => m.students.map((s: any) => ({ student: { id: s.id }, mentor: { id: m.id } })))
    .flat();

  const filterFreeStudents = (students: Student[]) =>
    students.filter(s => !distibution.find(d => d.student.id === s.id));

  const freeStudents = filterFreeStudents(availableStudents);
  const mentors = filterMentors(allMentors);

  const result = assignStudents(mentors, freeStudents);
  distibution = distibution.concat(result);
  return distibution;
}

function assignStudents(mentors: Mentor[], students: Student[], predicate = (_: Student) => true) {
  const mentorCapacity = sumBy(mentors, 'capacity');
  const freeStudents = students
    .filter(predicate)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, mentorCapacity);
  return distributeRandomly(mentors, freeStudents);
}

function filterMentors(mentors: MentorInput[]): Mentor[] {
  return mentors
    .map(m => {
      const studentsCount = m.students.length;

      const capacity = Math.max(0, m.maxStudentsLimit - studentsCount);
      return { ...m, capacity };
    })
    .filter(m => m.capacity > 0);
}

function distributeRandomly(mentors: Mentor[], students: Student[]) {
  const pairs = [];
  let capacity = Math.min(sum(mentors.map(m => m.capacity)), students.length);
  const shuffledStudents = shuffle(students);

  while (capacity > 0) {
    for (const mentor of mentors) {
      const index = random(0, shuffledStudents.length - 1);

      const student = shuffledStudents[index];
      if (mentor.capacity > 0) {
        mentor.capacity--;
        shuffledStudents.splice(index, 1);
        if (student) {
          pairs.push({
            mentor: pick(mentor, ['id']),
            student: pick(student, ['id']),
          });
        }
        capacity--;
      }
    }
  }
  return pairs;
}
