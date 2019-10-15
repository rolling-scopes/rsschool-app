import _ from 'lodash';
import { getRepository } from 'typeorm';
import { StageInterview, StageInterviewFeedback } from '../models';

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
      'mentor.studentsPreference',
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
        studentsPreference: it.mentor.studentsPreference || '',
      },
    };
  });
  return result;
}

export async function getStageInterviewStudentFeedback(stageId: number, userId: number, studentId: number) {
  return getRepository(StageInterviewFeedback)
    .createQueryBuilder('stageInterviewFeedback')
    .innerJoin('stageInterviewFeedback.stageInterview', 'stageInterview')
    .innerJoin('stageInterview.mentor', 'mentor')
    .innerJoin('mentor.user', 'user')
    .where('stageInterview.stageId = :stageId', { stageId })
    .andWhere('stageInterview.studentId = :studentId', { studentId })
    .andWhere('user.id = :userId', { userId })
    .getOne();
}

export async function getStageInterviewsByMentorId(stageId: number, githubId: string) {
  const stageInterviews = await getRepository(StageInterview)
    .createQueryBuilder('stageInterview')
    .innerJoin('stageInterview.stage', 'stage')
    .innerJoin('stage.course', 'course')
    .innerJoin('stageInterview.mentor', 'mentor')
    .innerJoin('stageInterview.student', 'student')
    .innerJoin('mentor.user', 'mentorUser')
    .innerJoin('student.user', 'studentUser')
    .addSelect([
      'student.id',
      'studentUser.firstName',
      'studentUser.lastName',
      'studentUser.githubId',
    ])
    .where(`stage.id = :stageId
      AND mentorUser.githubId = :githubId
      AND "stageInterview"."isCompleted" = FALSE
    `, { stageId, githubId })
    .getMany();

  const result = stageInterviews.map(it => {
    return {
      id: it.student.id,
      githubId: it.student.user.githubId,
      firstName: it.student.user.firstName,
      lastName: it.student.user.lastName,
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
      'mentorUser.primaryEmail',
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
        contactsEmail: it.mentor.user.primaryEmail,
      },
    };
  });
  return result;
}

export async function getInterviewsByStudent(courseId: number, studentId: number) {
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
      'studentUser.id',
      'studentUser.githubId',
    ])
    .where('course.id = :courseId AND student.id = :studentId', { courseId, studentId })
    .getMany();

  const result = stageInterviews.map(it => {
    return {
      mentor: {
        id: it.mentor.id,
        githubId: it.mentor.user.githubId,
      },
      student: {
        id: it.student.id,
        githubId: it.student.user.githubId,
      },
    };
  });
  return result;
}
