import { groupBy, sumBy, shuffle, sum, pick, random, filter, sortBy, drop, entries } from 'lodash';
import { MentorDetails } from '../services/course.service';
import { InterviewInfo } from '../repositories/interview';

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

const MIN_INTERVIEW_COUNT = 4;

export function createInterviews(
  allMentors: MentorDetails[],
  allStudents: Student[],
  interviews: InterviewInfo[],
  useReserve: boolean = true,
) {
  // filter students who has interview already
  const availableStudents = allStudents.filter(s => !interviews.find(i => i.student.githubId === s.githubId));

  // create pairs if student already has mentor
  let distibution = allMentors
    .filter(m => m.students.length && !interviews.find(i => i.interviewer.githubId === m.githubId))
    .map(m => m.students.map((s: any) => ({ student: { id: s.id }, mentor: { id: m.id } })))
    .flat();

  const filterFreeStudents = (students: Student[]) =>
    students.filter(s => !distibution.find(d => d.student.id === s.id));

  const freeStudents = filterFreeStudents(availableStudents);

  const cityMentors = groupBy(extractMentors(allMentors, interviews, 'city'), 'cityName');
  const countryMentors = groupBy(extractMentors(allMentors, interviews, 'country'), 'countryName');
  let anyMentors = sortBy(filterMentors(filter(allMentors, { studentsPreference: 'any' }), interviews), ['id']);

  // reserver 20% mentors
  const reserveCount = useReserve ? Math.max(6, Math.round(anyMentors.length * 0.2)) : 0;
  anyMentors = drop(anyMentors, reserveCount);

  let students: typeof freeStudents = [];
  for (const [cityName, mentors] of entries(cityMentors)) {
    students = findStudents(mentors, freeStudents, students, cityPredicate(cityName));
  }
  for (const [countryName, mentors] of entries(countryMentors)) {
    students = findStudents(mentors, freeStudents, students, countryPredicate(countryName));
  }
  students = findStudents(anyMentors, freeStudents, students);

  for (const [cityName, mentors] of entries(cityMentors)) {
    const result = assignStudents(mentors, filterFreeStudents(students), cityPredicate(cityName));
    distibution = distibution.concat(result);
  }
  for (const [countryName, mentors] of entries(countryMentors)) {
    const result = assignStudents(mentors, filterFreeStudents(students), countryPredicate(countryName));
    distibution = distibution.concat(result);
  }
  const result = assignStudents(anyMentors, filterFreeStudents(students));
  distibution = distibution.concat(result);
  return distibution;
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
