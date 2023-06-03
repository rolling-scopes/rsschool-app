import { groupBy, sumBy, shuffle, sum, pick, random, filter, sortBy, entries } from 'lodash';
import { MentorDetails } from '../services/course.service';
import { InterviewInfo } from '../repositories/interview.repository';

type Mentor = {
  id: number;
  githubId: string;
  cityName: string | null;
  countryName: string;
  capacity: number;
  lowGrade: boolean;
};

type Student = {
  id: number;
  githubId: string;
  cityName: string;
  countryName: string;
  mentor: { id: number } | null;
  totalScore: number;
};

type DistibutionPair = {
  student: {
    id: number;
  };
  mentor: {
    id: number;
  };
};

const MIN_INTERVIEW_COUNT = 4;

export function createInterviews(allMentors: MentorDetails[], allStudents: Student[], interviews: InterviewInfo[]) {
  // filter students who has interview already
  const availableStudents = allStudents.filter(s => !interviews.find(i => i.student.githubId === s.githubId));

  // create pairs if student already has mentor
  let distibution: DistibutionPair[] = allMentors
    // filter mentors who has students
    .filter(m => m.students.length)
    // create pairs
    .map(m => m.students.map((s: { id: number }) => ({ student: { id: s.id }, mentor: { id: m.id } })))
    .flat()
    // filter students who has interview already
    .filter(pair => !interviews.find(i => i.interviewer.id === pair.mentor.id && i.student.id === pair.student.id));

  const freeStudents = filterFreeStudents(distibution, availableStudents);

  const cityMentors = groupBy(extractMentors(allMentors, interviews, 'city'), 'cityName');
  const countryMentors = groupBy(extractMentors(allMentors, interviews, 'country'), 'countryName');
  const anyMentors = sortBy(filterMentors(filter(allMentors, { studentsPreference: 'any' }), interviews), ['id']);

  let students: typeof freeStudents = [];
  for (const [cityName, mentors] of entries(cityMentors)) {
    students = findStudents(mentors, freeStudents, students, cityPredicate(cityName));
  }
  for (const [countryName, mentors] of entries(countryMentors)) {
    students = findStudents(mentors, freeStudents, students, countryPredicate(countryName));
  }
  students = findStudents(anyMentors, freeStudents, students);

  for (const [cityName, mentors] of entries(cityMentors)) {
    const result = assignStudents(mentors, filterFreeStudents(distibution, students), cityPredicate(cityName));
    distibution = distibution.concat(result);
  }
  for (const [countryName, mentors] of entries(countryMentors)) {
    const result = assignStudents(mentors, filterFreeStudents(distibution, students), countryPredicate(countryName));
    distibution = distibution.concat(result);
  }
  const result = assignStudents(anyMentors, filterFreeStudents(distibution, students));
  distibution = distibution.concat(result);
  return distibution;
}

function filterFreeStudents(distibution: DistibutionPair[], students: Student[]) {
  return students.filter(s => !distibution.find(d => d.student.id === s.id));
}

function assignStudents(mentors: Mentor[], students: Student[], predicate = (_: Student) => true) {
  const mentorCapacity = sumBy(mentors, 'capacity');
  const freeStudents = students
    .filter(predicate)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, mentorCapacity);
  return distributeStudentsRandomly(mentors, freeStudents);
}

function extractMentors(
  allMentors: MentorDetails[],
  interviews: InterviewInfo[],
  preference: 'city' | 'country' | 'any',
) {
  return sortBy(filterMentors(filter(allMentors, { studentsPreference: preference }), interviews), ['id']);
}

function findStudents(
  mentors: Mentor[],
  allStudents: Student[],
  students: Student[],
  predicate = (_: Student) => true,
) {
  const mentorCapacity = sumBy(mentors, 'capacity');
  const freeStudents = allStudents
    .filter(s => {
      const newStudent = !students.find(student => student.id === s.id);
      return predicate(s) && newStudent;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, mentorCapacity);
  students = students.concat(freeStudents);
  return students;
}

function filterMentors(mentors: MentorDetails[], interviews: InterviewInfo[]): Mentor[] {
  return mentors
    .map(m => {
      const studentsCount = m.students.length;

      let lowGrade = false;
      const capacity = m.maxStudentsLimit - studentsCount;
      let maxCapacity = 0;

      if (studentsCount + capacity < MIN_INTERVIEW_COUNT) {
        if (capacity === 0) {
          lowGrade = true;
        }
        maxCapacity = MIN_INTERVIEW_COUNT - studentsCount;
      } else {
        maxCapacity = capacity > 1 ? capacity + 2 : capacity === 1 ? capacity + 1 : 0;
      }
      const interviewCount = interviews.filter(i => i.interviewer.githubId === m.githubId).length;
      const leftCapacity = Math.max(0, maxCapacity - interviewCount);
      return { ...m, capacity: leftCapacity, lowGrade };
    })
    .filter(m => m.capacity > 0);
}

export function distributeStudentsRandomly(mentors: Mentor[], students: Student[]) {
  const pairs = [];
  let capacity = Math.min(sum(mentors.map(m => m.capacity)), students.length);
  const shuffledStudents = shuffle(students);

  while (capacity > 0) {
    for (const mentor of mentors) {
      let index = random(0, shuffledStudents.length - 1);

      if (mentor.lowGrade) {
        let minScore = 0;
        shuffledStudents.forEach((student, i) => {
          if (minScore === 0 || student.totalScore < minScore) {
            minScore = student.totalScore;
            index = i;
          }
        });
      }

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

const cityPredicate = (cityName: string) => (s: { cityName: string }) => s.cityName === cityName;
const countryPredicate = (countryName: string) => (s: { countryName: string }) => s.countryName === countryName;
