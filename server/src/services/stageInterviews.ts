import _ from 'lodash';
import { getRepository } from 'typeorm';
import { StageInterview, StageInterviewFeedback, Student } from '../models';
import { StageInterviewFeedbackJson } from '../../../common/models';
import { StudentInterview } from './courseService';

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
      'student.isExpelled',
      'student.isFailed',
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
      id: it.id,
      isCompleted: it.isCompleted,
      student: {
        id: it.student.id,
        githubId: it.student.user.githubId,
        locationName: it.student.user.locationName,
        totalScore: it.student.totalScore,
        isActive: !it.student.isExpelled && !it.student.isFailed,
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
    .addSelect(['student.id', 'studentUser.firstName', 'studentUser.lastName', 'studentUser.githubId'])
    .where('stage.id = :stageId', { stageId })
    .andWhere('"mentorUser"."githubId" = :githubId', { githubId })
    .andWhere('"stageInterview"."isCompleted" = FALSE')
    .andWhere('"student"."isExpelled" = FALSE')
    .getMany();

  const result = stageInterviews.map(it => {
    return {
      id: it.student.id,
      githubId: it.student.user.githubId,
      name: `${it.student.user.firstName} ${it.student.user.lastName}`.trim(),
    };
  });
  return result;
}

export async function getStageInterviewsByStudent(courseId: number, githubId: string): Promise<StudentInterview[]> {
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
      name: 'Stage Interview',
      completed: it.isCompleted,
      endDate: null,
      interviewer: {
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

export function getStudentInterviewRatings({ skills, programmingTask }: StageInterviewFeedbackJson) {
  const commonSkills = Object.values(skills.common).filter(Boolean) as number[];
  const dataStructuresSkills = Object.values(skills.dataStructures).filter(Boolean) as number[];

  const htmlCss = skills.htmlCss.level;
  const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
  const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

  const ratingsCount = 4;
  const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];

  const rating = ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0;

  return { rating, htmlCss, common, dataStructures };
}

const isGoodCandidate = (stageInterviews: StageInterview[]) => stageInterviews.some(i => i.isCompleted);

const getLastRating = (stageInterviews: StageInterview[]) => {
  const [lastInterview] = stageInterviews
    .filter((interview: StageInterview) => interview.isCompleted)
    .map(({ stageInterviewFeedbacks }: StageInterview) =>
      stageInterviewFeedbacks.map((feedback: StageInterviewFeedback) => ({
        date: feedback.updatedDate,
        rating: getStudentInterviewRatings(JSON.parse(feedback.json)).rating,
      })),
    )
    .reduce((acc, cur) => acc.concat(cur), [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return lastInterview && lastInterview.rating !== undefined ? lastInterview.rating : null;
};

export async function getAvailableStudentsForStageInterview(courseId: number, _: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'user')
    .leftJoin('student.stageInterviews', 'stageInterview')
    .leftJoin('stageInterview.stageInterviewFeedbacks', 'stageInterviewFeedbacks')
    .addSelect([
      'user.id',
      'user.githubId',
      'user.firstName',
      'user.lastName',
      'user.locationName',
      'stageInterview.id',
      'stageInterview.isGoodCandidate',
      'stageInterview.isCompleted',
      'stageInterviewFeedbacks.json',
      'stageInterviewFeedbacks.updatedDate',
    ])
    .where(
      [
        `student.courseId = :courseId`,
        `student.isFailed = false`,
        `student.isExpelled = false`,
        `student.totalScore > 0`,
        `student.mentorId IS NULL`,
      ].join(' AND '),
      { courseId },
    )
    .orderBy('student.totalScore', 'DESC')
    .getMany();

  const result = students
    .filter(s => {
      return !s.stageInterviews || s.stageInterviews.length === 0 || s.stageInterviews.every(i => i.isCompleted);
    })
    .map(student => {
      const { id, user, totalScore } = student;
      const stageInterviews: StageInterview[] = student.stageInterviews || [];

      return {
        id,
        totalScore,
        githubId: user.githubId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        locationName: user.locationName,
        isGoodCandidate: isGoodCandidate(stageInterviews),
        rating: getLastRating(stageInterviews),
      };
    });
  return result;
}
