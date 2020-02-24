import { getRepository } from 'typeorm';
import { StudentStats } from '../../../../common/models/profile';
import { getFullName } from '../../lib/utils';
import {
  User,
  Mentor,
  Student,
  Course,
  Stage,
  Task,
  CourseTask,
  TaskResult,
  TaskInterviewResult,
  Certificate,
} from '../../models';
import { Permissions } from './permissions';

type StudentPosition = {
  courseId: number;
  position: number;
};

const getStudentPosition = async ({ totalScore, courseId }: StudentStats): Promise<StudentPosition> =>
  (
    await getRepository(Student)
      .createQueryBuilder('student')
      .select('"student"."courseId" AS "courseId"')
      .addSelect('COUNT(*) AS "position"')
      .where('"student"."courseId" = :courseId', { courseId })
      .andWhere('"student"."totalScore" >= :totalScore', { totalScore })
      .groupBy('"student"."courseId"')
      .getRawMany()
  ).map(({ courseId, position }) => ({ courseId, position: Number(position) }))[0];

const getStudentStatsWithoutPosition = async (githubId: string, permissions: Permissions): Promise<StudentStats[]> => {
  const { isCoreJsFeedbackVisible } = permissions;

  const query = await getRepository(Student)
    .createQueryBuilder('student')
    .select('"course"."id" AS "courseId"')
    .addSelect('"course"."name" AS "courseName"')
    .addSelect('"course"."locationName" AS "locationName"')
    .addSelect('"course"."fullName" AS "courseFullName"')
    .addSelect('"student"."isExpelled" AS "isExpelled"')
    .addSelect('"student"."expellingReason" AS "expellingReason"')
    .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
    .addSelect('"student"."totalScore" AS "totalScore"')
    .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
    .addSelect('"userMentor"."lastName" AS "mentorLastName"')
    .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
    .addSelect('"certificate"."publicId" AS "certificateId"')
    .addSelect('ARRAY_AGG ("courseTask"."maxScore") AS "taskMaxScores"')
    .addSelect('ARRAY_AGG ("courseTask"."scoreWeight") AS "taskScoreWeights"')
    .addSelect('ARRAY_AGG ("task"."name") AS "taskNames"')
    .addSelect('ARRAY_AGG ("task"."descriptionUrl") AS "taskDescriptionUris"')
    .addSelect('ARRAY_AGG ("taskResult"."githubPrUrl") AS "taskGithubPrUris"');

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
    .leftJoin(Stage, 'stage', '"stage"."courseId" = "student"."courseId"')
    .leftJoin(CourseTask, 'courseTask', '"courseTask"."stageId" = "stage"."id"')
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
    .groupBy('"course"."id", "student"."id", "userMentor"."id", "certificate"."publicId"')
    .orderBy('"course"."updatedDate"', 'DESC');

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
        position: null,
        mentor: {
          githubId: mentorGithubId,
          name: getFullName(mentorFirstName, mentorLastName, mentorGithubId),
        },
      };
    },
  );
};

export const getStudentStats = async (githubId: string, permissions: Permissions) => {
  const studentStats = await getStudentStatsWithoutPosition(githubId, permissions);
  const studentPositions = await Promise.all(studentStats.map(stats => getStudentPosition(stats)));
  const studentStatsWithPositions = studentStats.map((stats, idx) => ({ ...stats, ...studentPositions[idx] }));

  return studentStatsWithPositions;
};
