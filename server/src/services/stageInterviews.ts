import _ from 'lodash';
import { getRepository } from 'typeorm';
import { StageInterview } from '../models';

type Mentor = {
  id: number;
  githubId: string;
  capacity: number;
  locationName: string | null;
  countryName: string | null;
};

type Student = {
  id: number;
  githubId: string;
  totalScore: number;
  locationName: string | null;
  countryName: string | null;
};

export function createStageInterviewPairs(allMentors: Mentor[], allStudents: Student[], reserve = 20) {
  let result: { mentor: Mentor; student: Student }[] = [];
  const total = _.sum(allMentors.map(mentor => mentor.capacity)) - reserve;
  let availableStudents = allStudents.slice(0, total);
  const noSameLocationMentors: Mentor[] = [];

  allMentors.forEach(mentor => {
    if (availableStudents.length < 1) {
      return;
    }

    const sameLocationStudents = availableStudents.filter(s => s.locationName === mentor.locationName);
    if (sameLocationStudents.length < mentor.capacity) {
      noSameLocationMentors.push(mentor);
      return;
    }
    const githubIds = assignStudents(sameLocationStudents, mentor);
    availableStudents = availableStudents.filter(s => !githubIds.includes(s.githubId));
  });

  const noSameCountryMentors: Mentor[] = [];
  noSameLocationMentors.forEach(mentor => {
    if (availableStudents.length < 1) {
      return;
    }
    const sameCountryStudents = availableStudents.filter(s => s.countryName === mentor.countryName);
    if (sameCountryStudents.length < mentor.capacity) {
      noSameCountryMentors.push(mentor);
      return;
    }
    const githubIds = assignStudents(sameCountryStudents, mentor);
    availableStudents = availableStudents.filter(s => !githubIds.includes(s.githubId));
  });

  noSameCountryMentors.forEach(mentor => {
    if (availableStudents.length < 1) {
      return;
    }
    const githubIds = assignStudents(availableStudents, mentor);
    availableStudents = availableStudents.filter(s => !githubIds.includes(s.githubId));
  });

  return result;

  function assignStudents(students: Student[], mentor: Mentor) {
    const mentorsStudents: Student[] = [];

    if (mentor.capacity === 1) {
      mentorsStudents.push(students[0]);
    } else {
      mentorsStudents.push(students[0], students[students.length - 1]);
    }
    if (mentor.capacity > 2) {
      const step = Math.max(Math.floor(students.length / (mentor.capacity - 1 || 1)), 1);
      const indices = _.range(1, mentor.capacity - 1).map(i => i * step);
      indices.forEach(i => {
        if (students[i]) {
          mentorsStudents.push(students[i]);
        }
      });
    }

    result = result.concat(
      mentorsStudents.map(student => ({
        mentor,
        student,
      })),
    );
    mentor.capacity = 0;
    return mentorsStudents.map(m => m.githubId);
  }
}

export async function getStageInterviewsPairs(stageId: number) {
  const stageInterviews = await getRepository(StageInterview)
    .createQueryBuilder('stageInterview')
    .innerJoin('stageInterview.stage', 'stage')
    .innerJoin('stage.course', 'course')
    .innerJoin('stageInterview.mentor', 'mentor')
    .innerJoin('stageInterview.student', 'student')
    .innerJoin('mentor.user', 'mentorUser')
    .innerJoin('student.user', 'studentUser')
    .addSelect([
      'mentor.id',
      'student.id',
      'student.totalScore',
      'mentorUser.id',
      'mentorUser.githubId',
      'mentorUser.locationName',
      'studentUser.id',
      'studentUser.githubId',
      'studentUser.locationName',
    ])
    .where('stage.id = :stageId', { stageId })
    .getMany();

  const result = stageInterviews.map(it => {
    return {
      student: {
        id: it.student.id,
        githubId: it.student.user.githubId,
        locationName: it.student.user.locationName,
        totalScore: it.student.totalScore,
      },
      mentor: {
        id: it.mentor.id,
        githubId: it.mentor.user.githubId,
        locationName: it.mentor.user.locationName,
      },
    };
  });
  return result;
}

export async function getInterviewsByGithubId(courseId: number, githubId: string) {
  const stageInterviews = await getRepository(StageInterview)
    .createQueryBuilder('stageInterview')
    .innerJoin('stageInterview.stage', 'stage')
    .innerJoin('stage.course', 'course')
    .innerJoin('stageInterview.mentor', 'mentor')
    .innerJoin('stageInterview.student', 'student')
    .innerJoin('mentor.user', 'mentorUser')
    .innerJoin('student.user', 'studentUser')
    .addSelect([
      'mentor.id',
      'student.id',
      'student.totalScore',
      'mentorUser.id',
      'mentorUser.githubId',
      'mentorUser.locationName',
      'mentorUser.contactsNotes',
      'mentorUser.contactsSkype',
      'mentorUser.contactsTelegram',
      'mentorUser.contactsPhone',
      'studentUser.id',
      'studentUser.githubId',
      'studentUser.locationName',
    ])
    .where('course.id = :courseId AND studentUser.githubId = :githubId', { courseId, githubId })
    .getMany();

  const result = stageInterviews.map(it => {
    return {
      mentor: {
        id: it.mentor.id,
        githubId: it.mentor.user.githubId,
        locationName: it.mentor.user.locationName,
        contactsPhone: it.mentor.user.contactsPhone,
        contactsTelegram: it.mentor.user.contactsTelegram,
        contactsSkype: it.mentor.user.contactsSkype,
        contactsNotes: it.mentor.user.contactsNotes,
      },
    };
  });
  return result;
}
