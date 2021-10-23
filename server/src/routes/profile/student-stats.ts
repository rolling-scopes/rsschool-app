import { getRepository } from 'typeorm';
import { StudentStats } from '../../../../common/models/profile';
import { getFullName } from '../../rules';
import {
  User,
  Mentor,
  Student,
  Course,
  Task,
  CourseTask,
  TaskResult,
  TaskInterviewResult,
  Certificate,
} from '../../models';
import { Permissions } from './permissions';

const getStudentStatsWithPosition = async (githubId: string, permissions: Permissions): Promise<StudentStats[]> => {
  const { isCoreJsFeedbackVisible, isExpellingReasonVisible } = permissions;

  const query = await getRepository(Student)
    .createQueryBuilder('student')
    .select('"course"."id" AS "courseId"')
    .addSelect('"course"."name" AS "courseName"')
    .addSelect('"course"."locationName" AS "locationName"')
    .addSelect('"course"."fullName" AS "courseFullName"')
    .addSelect('"student"."isExpelled" AS "isExpelled"')
    .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
    .addSelect('"student"."totalScore" AS "totalScore"')
    .addSelect('"student"."rank" AS "rank"')
    .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
    .addSelect('"userMentor"."lastName" AS "mentorLastName"')
    .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
    .addSelect('"certificate"."publicId" AS "certificateId"')
    .addSelect('ARRAY_AGG ("courseTask"."maxScore") AS "taskMaxScores"')
    .addSelect('ARRAY_AGG ("courseTask"."scoreWeight") AS "taskScoreWeights"')
    .addSelect('ARRAY_AGG ("task"."name") AS "taskNames"')
    .addSelect('ARRAY_AGG ("task"."descriptionUrl") AS "taskDescriptionUris"')
    .addSelect('ARRAY_AGG ("taskResult"."githubPrUrl") AS "taskGithubPrUris"');

  if (isExpellingReasonVisible) {
    query.addSelect('"student"."expellingReason" AS "expellingReason"');
  }

  if (isCoreJsFeedbackVisible) {
    query
      .addSelect('ARRAY_AGG (COALESCE("taskResult"."score", "taskInterview"."score")) AS "taskScores"')
      .addSelect('ARRAY_AGG (COALESCE("taskResult"."comment", "taskInterview"."comment")) AS "taskComments"')
      .addSelect('ARRAY_AGG ("taskInterview"."formAnswers") AS "taskInterviewFormAnswers"')
      .addSelect('ARRAY_AGG ("interviewer"."githubId") AS "interviewerGithubId"')
      .addSelect('ARRAY_AGG ("interviewer"."firstName") AS "interviewerFirstName"')
      .addSelect('ARRAY_AGG ("interviewer"."lastName") AS "interviewerLastName"');
  } else {
    query
      .addSelect('ARRAY_AGG (COALESCE("taskResult"."score", "taskInterview"."score")) AS "taskScores"')
      .addSelect('ARRAY_AGG ("taskResult"."comment") AS "taskComments"');
  }

  query
    .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
    .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
    .leftJoin(Course, 'course', '"course"."id" = "student"."courseId"')
    .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
    .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
    .leftJoin(CourseTask, 'courseTask', '"courseTask"."courseId" = "student"."courseId"')
    .leftJoin(Task, 'task', '"courseTask"."taskId" = "task"."id"')
    .leftJoin(
      TaskResult,
      'taskResult',
      '"taskResult"."studentId" = "student"."id" AND "taskResult"."courseTaskId" = "courseTask"."id"',
    )
    .leftJoin(
      TaskInterviewResult,
      'taskInterview',
      '"taskInterview"."studentId" = "student"."id" AND "taskInterview"."courseTaskId" = "courseTask"."id"',
    );

  if (isCoreJsFeedbackVisible) {
    query
      .leftJoin(Mentor, 'mentorInterviewer', '"mentorInterviewer"."id" = "taskInterview"."mentorId"')
      .leftJoin(User, 'interviewer', '"interviewer"."id" = "mentorInterviewer"."userId"');
  }

  query
    .where('"user"."githubId" = :githubId', { githubId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .groupBy('"course"."id", "student"."id", "userMentor"."id", "certificate"."publicId"')
    .orderBy('"course"."endDate"', 'DESC');

  const rawStats = await query.getRawMany();

  return rawStats.map(
    ({
      courseId,
      courseName,
      locationName,
      courseFullName,
      isExpelled,
      expellingReason,
      isCourseCompleted,
      totalScore,
      mentorFirstName,
      mentorLastName,
      mentorGithubId,
      taskMaxScores,
      taskScoreWeights,
      taskNames,
      taskDescriptionUris,
      taskGithubPrUris,
      taskScores,
      taskComments,
      taskInterviewFormAnswers,
      interviewerGithubId,
      interviewerFirstName,
      interviewerLastName,
      certificateId,
      rank,
    }: any) => {
      const tasks = taskMaxScores.map((maxScore: number, idx: number) => ({
        maxScore,
        scoreWeight: taskScoreWeights[idx],
        name: taskNames[idx],
        descriptionUri: taskDescriptionUris[idx],
        githubPrUri: taskGithubPrUris[idx],
        score: taskScores[idx],
        comment: taskComments[idx],
        interviewFormAnswers: (taskInterviewFormAnswers && taskInterviewFormAnswers[idx]) || undefined,
        interviewer:
          interviewerGithubId && interviewerGithubId[idx]
            ? {
                name: getFullName(interviewerFirstName[idx], interviewerLastName[idx], interviewerGithubId[idx]),
                githubId: interviewerGithubId[idx],
              }
            : undefined,
      }));
      return {
        courseId,
        courseName,
        locationName,
        courseFullName,
        isExpelled,
        expellingReason,
        isCourseCompleted,
        totalScore,
        tasks,
        certificateId,
        rank,
        mentor: {
          githubId: mentorGithubId,
          name: getFullName(mentorFirstName, mentorLastName, mentorGithubId),
        },
      };
    },
  );
};

export const getStudentStats = async (githubId: string, permissions: Permissions) => {
  const studentStats = await getStudentStatsWithPosition(githubId, permissions);
  return studentStats;
};
