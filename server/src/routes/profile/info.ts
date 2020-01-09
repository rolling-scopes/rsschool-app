import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import {
  CourseTask,
  Student,
  Mentor,
  Task,
  User,
  StageInterview,
  Feedback,
  Course,
  Stage,
  TaskResult,
  TaskInterviewResult,
  StageInterviewFeedback,
} from '../../models';
// import { IUserSession } from '../../models/session';
import { setResponse } from '../utils';
import { getStudentInterviewRatings } from '../../services/stageInterviews';
import {
  MentorStats,
  StudentStats,
  PublicFeedback,
  StageInterviewDetailedFeedback,
  ProfileInfo,
  UserInfo,
} from '../../../../common/models/profile';

/*
  WHO CAN SEE
    Admins               | Assigned mentor | Mentors | Assigned student | All
    ***
                                1. General info [+]
    Name                 | Yes             | Yes     | Yes              | Yes
    Github               | Yes             | Yes     | *                | *
    Primary email        | *               | *       | *                | *
    English              | Yes             | Yes     | *                | *
    Education            | *               | *       | *                | *
    LinkedIn profile     | *               | *       | *                | *
    Location (main)      | Yes             | Yes     | *                | *
    Other location       | *               | *       | *                | *

                                2. Contacts [+]
    EPAM email           | No              | No      | No               | No
    Telegram             | *               | *       | *                | *
    Skype                | *               | *       | *                | *
    Phone                | *               | *       | *                | *
    Contact notes        | *               | *       | *                | *

                                3. Public feedback (Gratitude) [+]
    *

                                4. Statistics
    Count of mentored    | Yes             | Yes     | Yes              | *
    students
    Number of courses    | Yes             | Yes     | Yes              | *
    as a mentor

                                5. Course statistics
    Course when was      | Yes             | Yes     | Yes              | *
    a mentor/student
    List of students     | No              | No      | No               | No
    for mentor for
    each course
    List of tasks/scores | Yes             | Yes     | No               | *
    for student for
    each course

    Stage interview      | Yes             | Yes     | No               | *
    Feedback
    (Pre-Screening)
    Core JS Interview    | Yes             | Yes     | No               | *
    Feedback
*/

const getUserInfo = async (githubId: string): Promise<UserInfo> => {
  const rawUser = await getRepository(User)
    .createQueryBuilder('user')
    .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
    .addSelect('"user"."githubId" AS "githubId"')
    .addSelect('"user"."locationName" AS "locationName"')
    .addSelect('"user"."educationHistory" AS "educationHistory"')
    .addSelect('"user"."employmentHistory" AS "employmentHistory"')
    .addSelect('"user"."englishLevel" AS "englishLevel"')
    .addSelect('"user"."contactsPhone" AS "contactsPhone"')
    .addSelect('"user"."contactsEmail" AS "contactsEmail"')
    .addSelect('"user"."contactsTelegram" AS "contactsTelegram"')
    .addSelect('"user"."contactsSkype" AS "contactsSkype"')
    .addSelect('"user"."contactsNotes" AS "contactsNotes"')
    .addSelect('"user"."aboutMyself" AS "aboutMyself"')
    .where('"user"."githubId" = :githubId', { githubId })
    .getRawOne();

  const {
    firstName,
    lastName,
    locationName,
    educationHistory,
    employmentHistory,
    englishLevel,
    contactsPhone,
    contactsEmail,
    contactsTelegram,
    contactsSkype,
    contactsNotes,
    aboutMyself,
  } = rawUser;

  return {
    generalInfo: {
      githubId,
      aboutMyself,
      locationName,
      educationHistory,
      employmentHistory,
      englishLevel,
      name: [firstName, lastName].join(' '),
    },
    contacts: {
      phone: contactsPhone,
      email: contactsEmail,
      skype: contactsSkype,
      telegram: contactsTelegram,
      notes: contactsNotes,
    },
  };
};

const getMentorStats = async (githubId: string): Promise<MentorStats[]> => (await getRepository(Mentor)
  .createQueryBuilder('mentor')
  .select('"course"."name" AS "courseName"')
  .addSelect('"course"."locationName" AS "locationName"')
  .addSelect('"course"."fullName" AS "courseFullName"')
  .addSelect('ARRAY_AGG ("userStudent"."githubId") AS "studentGithubIds"')
  .addSelect('ARRAY_AGG ("userStudent"."firstName") AS "studentFirstNames"')
  .addSelect('ARRAY_AGG ("userStudent"."lastName") AS "studentLastNames"')
  .leftJoin(User, 'user', '"user"."id" = "mentor"."userId"')
  .leftJoin(Course, 'course', '"course"."id" = "mentor"."courseId"')
  .leftJoin(Student, 'student', '"student"."mentorId" = "mentor"."id"')
  .leftJoin(User, 'userStudent', '"userStudent"."id" = "student"."userId"')
  .where('"user"."githubId" = :githubId', { githubId })
  .groupBy('"course"."id"')
  .orderBy('"course"."updatedDate"', 'ASC')
  .getRawMany())
  .map(({
    courseName,
    locationName,
    courseFullName,
    studentGithubIds,
    studentFirstNames,
    studentLastNames,
  }: any) => {
    const students = studentGithubIds.map((githubId: string, idx: number) => ({
      githubId,
      name: [studentFirstNames[idx], studentLastNames[idx]].join(' '),
    }));
    return { courseName, locationName, courseFullName, students };
  });

const getStudentStats = async (githubId: string): Promise<StudentStats[]> => (await getRepository(Student)
  .createQueryBuilder('student')
  .select('"course"."name" AS "courseName"')
  .addSelect('"course"."locationName" AS "locationName"')
  .addSelect('"course"."fullName" AS "courseFullName"')
  .addSelect('"student"."isExpelled" AS "isExpelled"')
  .addSelect('"student"."expellingReason" AS "expellingReason"')
  .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
  .addSelect('"student"."totalScore" AS "totalScore"')
  .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
  .addSelect('"userMentor"."lastName" AS "mentorLastName"')
  .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
  .addSelect('ARRAY_AGG ("courseTask"."maxScore") AS "taskMaxScores"')
  .addSelect('ARRAY_AGG ("courseTask"."scoreWeight") AS "taskScoreWeights"')
  .addSelect('ARRAY_AGG ("task"."name") AS "taskNames"')
  .addSelect('ARRAY_AGG ("task"."descriptionUrl") AS "taskDescriptionUris"')
  .addSelect('ARRAY_AGG (COALESCE("taskResult"."score", "taskInterview"."score")) AS "taskScores"')
  .addSelect('ARRAY_AGG (COALESCE("taskResult"."comment", "taskInterview"."comment")) AS "taskComments"')
  .addSelect('ARRAY_AGG ("taskInterview"."formAnswers") AS "taskInterviewFormAnswers"')
  .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
  .leftJoin(Course, 'course', '"course"."id" = "student"."courseId"')
  .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
  .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
  .leftJoin(Stage, 'stage', '"stage"."courseId" = "student"."courseId"')
  .leftJoin(CourseTask, 'courseTask', '"courseTask"."stageId" = "stage"."id"')
  .leftJoin(Task, 'task', '"courseTask"."taskId" = "task"."id"')
  .leftJoin(TaskResult, 'taskResult', '"taskResult"."studentId" = "student"."id" AND "taskResult"."courseTaskId" = "courseTask"."id"')
  .leftJoin(TaskInterviewResult, 'taskInterview', '"taskInterview"."studentId" = "student"."id" AND "taskInterview"."courseTaskId" = "courseTask"."id"')
  .where('"user"."githubId" = :githubId', { githubId })
  .groupBy('"course"."id", "student"."id", "userMentor"."id"')
  .orderBy('"course"."updatedDate"', 'ASC')
  .getRawMany())
  .map(({
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
    taskScores,
    taskComments,
    taskInterviewFormAnswers,
  }: any) => {
    const tasks = taskMaxScores.map((maxScore: number, idx: number) => ({
      maxScore,
      scoreWeight: taskScoreWeights[idx],
      name: taskNames[idx],
      descriptionUri: taskDescriptionUris[idx],
      score: taskScores[idx],
      comment: taskComments[idx],
      interviewFormAnswers: taskInterviewFormAnswers[idx] || undefined,
    }));
    return {
      courseName,
      locationName,
      courseFullName,
      isExpelled,
      expellingReason,
      isCourseCompleted,
      totalScore,
      tasks,
      mentor: {
        githubId: mentorGithubId,
        name: [mentorFirstName, mentorLastName].join(' '),
      },
    };
  });

const getFeedback = async (githubId: string): Promise<PublicFeedback[]> => (await getRepository(Feedback)
  .createQueryBuilder('feedback')
  .select('"feedback"."updatedDate" AS "feedbackDate"')
  .addSelect('"feedback"."badgeId" AS "badgeId"')
  .addSelect('"feedback"."comment" AS "comment"')
  .addSelect('"feedback"."heroesUrl" AS "heroesUri"')
  .addSelect('"fromUser"."firstName" AS "fromUserFirstName", "fromUser"."lastName" AS "fromUserLastName"')
  .addSelect('"fromUser"."githubId" AS "fromUserGithubId"')
  .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
  .leftJoin(User, 'fromUser', '"fromUser"."id" = "feedback"."fromUserId"')
  .where('"user"."githubId" = :githubId', { githubId })
  .getRawMany())
  .map(({
    feedbackDate,
    badgeId,
    comment,
    heroesUri,
    fromUserFirstName,
    fromUserLastName,
    fromUserGithubId,
  }: any) => ({
    feedbackDate,
    badgeId,
    comment,
    heroesUri,
    fromUser: {
      name: [fromUserFirstName, fromUserLastName].join(' '),
      githubId: fromUserGithubId,
    },
  }));

const getStageInterviewFeedback = async (githubId: string): Promise<StageInterviewDetailedFeedback[]> => (
  await getRepository(StageInterview)
  .createQueryBuilder('stageInterview')
  .select('"stageInterview"."decision" AS "decision"')
  .addSelect('"stageInterview"."isGoodCandidate" AS "isGoodCandidate"')
  .addSelect('"course"."name" AS "courseName"')
  .addSelect('"course"."fullName" AS "courseFullName"')
  .addSelect('"stageInterviewFeedback"."json" AS "interviewResultJson"')
  .addSelect('"stageInterviewFeedback"."updatedDate" AS "interviewFeedbackDate"')
  .addSelect('"userMentor"."firstName" AS "interviewerFirstName"')
  .addSelect('"userMentor"."lastName" AS "interviewerLastName"')
  .addSelect('"userMentor"."githubId" AS "interviewerGithubId"')
  .leftJoin(Student, 'student', '"student"."id" = "stageInterview"."studentId"')
  .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
  .leftJoin(Stage, 'stage', '"stage"."id" = "stageInterview"."stageId"')
  .leftJoin(Course, 'course', '"course"."id" = "stage"."courseId"')
  .leftJoin(StageInterviewFeedback, 'stageInterviewFeedback', '"stageInterview"."id" = "stageInterviewFeedback"."stageInterviewId"')
  .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
  .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
  .where('"user"."githubId" = :githubId', { githubId })
  .andWhere('"stageInterview"."isCompleted" = true')
  .orderBy('"course"."updatedDate"', 'ASC')
  .getRawMany())
  .map(({
    decision,
    isGoodCandidate,
    courseName,
    courseFullName,
    interviewResultJson,
    interviewFeedbackDate,
    interviewerFirstName,
    interviewerLastName,
    interviewerGithubId,
  }: any) => {
    const interviewResult = JSON.parse(interviewResultJson);
    const { english, programmingTask, resume } = interviewResult;
    const { rating, htmlCss, common, dataStructures } = getStudentInterviewRatings(interviewResult);
    return {
      decision,
      isGoodCandidate,
      courseName,
      courseFullName,
      programmingTask,
      rating,
      comment: resume.comment,
      english: english.levelMentorOpinion ? english.levelMentorOpinion : english.levelStudentOpinion,
      date: interviewFeedbackDate,
      skills: {
        htmlCss,
        common,
        dataStructures,
      },
      interviewer: {
        name: [interviewerFirstName, interviewerLastName].join(' '),
        githubId: interviewerGithubId,
      },
    } as StageInterviewDetailedFeedback;
  });

export const getProfileInfo = (_: ILogger) => async (ctx: Router.RouterContext) => {
  // const { isAdmin, roles } = ctx.state!.user as IUserSession;
  const { githubId } = ctx.query as { githubId: string | undefined };

  // console.log('GITHUB =>', githubId);
  // console.log('ADMIN =>', isAdmin);
  // console.log('ROLES =>', roles);

  if (!githubId) {
    return setResponse(ctx, NOT_FOUND);
  }

  const { generalInfo, contacts } = await getUserInfo(githubId);
  const publicFeedback = await getFeedback(githubId);
  const mentorStats = await getMentorStats(githubId);
  const studentStats = await getStudentStats(githubId);
  const stageInterviewFeedback = await getStageInterviewFeedback(githubId);

  const profileInfo: ProfileInfo = {
    generalInfo,
    contacts,
    mentorStats,
    studentStats,
    publicFeedback,
    stageInterviewFeedback,
  };

  console.log(JSON.stringify(profileInfo, null, 2));

  setResponse(ctx, OK, profileInfo);
};
