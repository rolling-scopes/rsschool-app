import _ from 'lodash';

type Mentor = {
  id: number;
  githubId: string;
  capacity: number;
  locationName: string | null;
  countryName: string | null;
  studentsPreference: 'sameCity' | 'sameCountry' | null;
};

type Student = {
  id: number;
  githubId: string;
  totalScore: number;
  locationName: string | null;
  countryName: string | null;
};

export function createInterviewPairs(allMentors: Mentor[], allStudents: Student[], reserve: number) {
  const result: { mentorId: number; studentId: number }[] = [];
  const total = _.sum(allMentors.map(mentor => mentor.capacity)) - reserve;

  let availableStudents = allStudents.slice(0, total);

  assignSameCityStudents();
  assignSameCountryStudents();

  const noSameLocationMentors: Mentor[] = [];
  allMentors.forEach(mentor => {
    if (availableStudents.length < 1 || mentor.capacity === 0) {
      return;
    }
    const students = availableStudents.filter(s => s.locationName === mentor.locationName);
    if (students.length < mentor.capacity) {
      noSameLocationMentors.push(mentor);
      return;
    }
    assignStudents(students, mentor);
  });

  const noSameCountryMentors: Mentor[] = [];
  noSameLocationMentors.forEach(mentor => {
    if (availableStudents.length < 1 || mentor.capacity === 0) {
      return;
    }
    const students = availableStudents.filter(s => s.countryName === mentor.countryName);
    if (students.length < mentor.capacity) {
      noSameCountryMentors.push(mentor);
      return;
    }
    assignStudents(students, mentor);
  });

  noSameCountryMentors.forEach(mentor => {
    if (availableStudents.length < 1 || mentor.capacity === 0) {
      return;
    }
    assignStudents(availableStudents, mentor);
  });

  return result;

  function assignSameCountryStudents() {
    const sameCountryMentors = allMentors.filter(m => m.studentsPreference === 'sameCountry');
    const countryGroups = _.groupBy(sameCountryMentors, 'countryName');
    for (const locationName of _.keys(countryGroups)) {
      const students = availableStudents.filter(s => s.locationName === locationName);
      const mentors = countryGroups[locationName];
      const pairs = distributeStudentsRandomly(mentors, students);
      availableStudents = availableStudents.filter(s => !pairs.some(p => p.studentId === s.id));
      result.push(...pairs);
    }
  }

  function assignSameCityStudents() {
    const sameCityMentors = allMentors.filter(m => m.studentsPreference === 'sameCity');
    const groups = _.groupBy(sameCityMentors, 'locationName');
    for (const locationName of _.keys(groups)) {
      const students = availableStudents.filter(s => s.locationName === locationName);
      const mentors = groups[locationName];
      const pairs = distributeStudentsRandomly(mentors, students);
      availableStudents = availableStudents.filter(s => !pairs.some(p => p.studentId === s.id));
      result.push(...pairs);
    }
  }

  function distributeStudentsRandomly(mentors: Mentor[], students: Student[]) {
    const pairs = [];
    let capacity = Math.min(_.sum(mentors.map(m => m.capacity)), students.length);
    while (capacity > 0) {
      for (const mentor of mentors) {
        const index = _.random(0, students.length - 1);
        const student = students[index];
        if (mentor.capacity > 0) {
          mentor.capacity--;
          students.splice(index, 1);
          pairs.push({ mentorId: mentor.id, studentId: student.id });
          capacity--;
        }
      }
    }
    return pairs;
  }

  function assignStudents(students: Student[], mentor: Mentor) {
    const mentorsStudents: Student[] = [];

    const capacity = Math.max(mentor.capacity, 0);
    if (capacity === 0) {
      return;
    }
    if (capacity === 1) {
      mentorsStudents.push(students[0]);
    } else {
      mentorsStudents.push(students[0], students[students.length - 1]);
    }
    if (capacity > 2) {
      const step = Math.max(Math.floor(students.length / (capacity - 1 || 1)), 1);
      const indices = _.range(1, capacity - 1).map(i => i * step);
      indices.forEach(i => {
        if (students[i]) {
          mentorsStudents.push(students[i]);
        }
      });
    }

    const arr = mentorsStudents.map(student => ({ mentorId: mentor.id, studentId: student.id }));
    result.push(...arr);
    mentor.capacity = 0;
    const githubIds = mentorsStudents.map(s => s.githubId);
    availableStudents = availableStudents.filter(s => !githubIds.includes(s.githubId));
  }
}
