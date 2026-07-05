import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import uniqBy from 'lodash/uniqBy';
import omit from 'lodash/omit';
import { User } from '@entities/user';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { ProfilePermissions } from '@entities/profilePermissions';
import { TaskChecker } from '@entities/taskChecker';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewFeedback } from '@entities/stageInterviewFeedback';
import { MentorRegistry } from '@entities/mentorRegistry';
import { Discipline } from '@entities/discipline';
import { Course } from '@entities/course';
import { CourseTask } from '@entities/courseTask';
import { Task } from '@entities/task';
import { TaskResult } from '@entities/taskResult';
import { Certificate } from '@entities/certificate';
import { Feedback } from '@entities/feedback';
import { IUserSession } from '@entities/session';
import {
  ConfigurableProfilePermissions,
  MentorStats,
  PublicFeedback,
  StageInterviewDetailedFeedback,
  StudentStats,
  UserInfo,
} from '@common/models/profile';
import { StageInterviewFeedbackJson } from '@common/models';
import { getInterviewRatings } from '../../courses/course-students/course-students.service';
import {
  defineRole,
  getFullName,
  getPermissions,
  getProfilePermissionsSettings,
  Permissions,
  Relations,
  RelationRole,
} from './permissions';

// use this as a mark for identifying self-expelled students.
const SELF_EXPELLED_MARK = 'Self expelled from the course';

@Injectable()
export class ProfileInfoService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  public async getProfileInfo(session: IUserSession, requestedGithubIdQuery?: string) {
    const { githubId: userGithubId, isAdmin } = session;
    const requestedGithubId = requestedGithubIdQuery || userGithubId;

    if (!requestedGithubId) {
      throw new NotFoundException('githubId is not defined');
    }

    const isProfileOwner = requestedGithubId === userGithubId;

    const profilePermissions = await this.getConfigurableProfilePermissions(requestedGithubId);

    let role: RelationRole | undefined;
    let permissions: Permissions;
    let permissionsSettings: ConfigurableProfilePermissions | undefined;
    if (isProfileOwner) {
      permissions = getPermissions({ isProfileOwner, isAdmin });
      permissionsSettings = getProfilePermissionsSettings(profilePermissions);
    } else {
      const relationsRoles = await this.getRelationsRoles(userGithubId, requestedGithubId);
      const [studentCourses, registryCourses] = !relationsRoles
        ? await Promise.all([this.getStudentCourses(requestedGithubId), this.getMentorCourses(requestedGithubId)])
        : [null, null];
      role = defineRole({ relationsRoles, studentCourses, registryCourses, session, userGithubId });
      permissions = getPermissions({ isAdmin, isProfileOwner, role, permissions: profilePermissions });
    }

    const {
      isProfileVisible,
      isPublicFeedbackVisible,
      isMentorStatsVisible,
      isStudentStatsVisible,
      isStageInterviewFeedbackVisible,
    } = permissions;

    if (!isProfileVisible && !isProfileOwner) {
      throw new ForbiddenException('Profile is not visible');
    }

    const { generalInfo, contacts, discord } = await this.getUserInfo(requestedGithubId, permissions);
    const publicFeedback = isPublicFeedbackVisible ? await this.getPublicFeedback(requestedGithubId) : undefined;
    const mentorStats = isMentorStatsVisible ? await this.getMentorStats(requestedGithubId) : undefined;
    const studentStats = isStudentStatsVisible ? await this.getStudentStats(requestedGithubId, permissions) : undefined;
    const stageInterviewFeedback = isStageInterviewFeedbackVisible
      ? await this.getStageInterviewFeedback(requestedGithubId)
      : undefined;

    return {
      permissionsSettings,
      generalInfo,
      contacts,
      discord,
      mentorStats,
      publicFeedback,
      stageInterviewFeedback,
      studentStats,
    };
  }

  public async getStudentCourses(githubId: string): Promise<{ courseId: number }[] | null> {
    const result = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .select('"student"."courseId" AS "courseId"')
      .leftJoin(Student, 'student', '"student"."userId" = "user"."id"')
      .where('"user"."githubId" = :githubId', { githubId })
      .getRawMany();
    return result ?? null;
  }

  public async getMentorCourses(githubId: string): Promise<{ courseId: number }[] | null> {
    const [registerdCourseIds, registryCourseIds] = await Promise.all([
      this.getRegisteredMentorsCourseIds(githubId),
      this.getMentorsFromRegistryCourseIds(githubId),
    ]);

    const mentorsCourses = registerdCourseIds.concat(registryCourseIds);

    return mentorsCourses.length ? mentorsCourses : null;
  }

  private async getRegisteredMentorsCourseIds(githubId: string) {
    const result: { courseId: number }[] = await this.dataSource
      .getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select(['mentor.courseId'])
      .leftJoin('mentor.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .getMany();

    return result.length ? result : [];
  }

  private async getMentorsFromRegistryCourseIds(githubId: string) {
    const result = await this.dataSource
      .getRepository(MentorRegistry)
      .createQueryBuilder('mentorRegistry')
      .select(['mentorRegistry.preferedCourses', 'mentorRegistry.technicalMentoring'])
      .leftJoin('mentorRegistry.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .andWhere('"mentorRegistry".canceled = false')
      .getOne();

    const disciplines = await this.dataSource
      .getRepository(Discipline)
      .find({ where: { name: In(result?.technicalMentoring ?? []) } });
    const disciplinesIds = disciplines.map(({ id }) => id);
    const coursesByDisciplines = await this.dataSource
      .getRepository(Course)
      .find({ where: { disciplineId: In(disciplinesIds) } });

    const preferredCourseIds = result?.preferedCourses?.map(courseId => ({ courseId: Number(courseId) })) ?? [];
    const courseIdsByDisciplines = coursesByDisciplines.map(({ id }) => ({ courseId: id }));

    const courseIds = uniqBy(preferredCourseIds.concat(courseIdsByDisciplines), ({ courseId }) => courseId);

    return courseIds;
  }

  public async getConfigurableProfilePermissions(githubId: string): Promise<ConfigurableProfilePermissions> {
    return (
      (await this.dataSource
        .getRepository(ProfilePermissions)
        .createQueryBuilder('pp')
        .select('"pp"."isProfileVisible" AS "isProfileVisible"')
        .addSelect('"pp"."isAboutVisible" AS "isAboutVisible"')
        .addSelect('"pp"."isEducationVisible" AS "isEducationVisible"')
        .addSelect('"pp"."isEnglishVisible" AS "isEnglishVisible"')
        .addSelect('"pp"."isEmailVisible" AS "isEmailVisible"')
        .addSelect('"pp"."isTelegramVisible" AS "isTelegramVisible"')
        .addSelect('"pp"."isSkypeVisible" AS "isSkypeVisible"')
        .addSelect('"pp"."isPhoneVisible" AS "isPhoneVisible"')
        .addSelect('"pp"."isContactsNotesVisible" AS "isContactsNotesVisible"')
        .addSelect('"pp"."isLinkedInVisible" AS "isLinkedInVisible"')
        .addSelect('"pp"."isPublicFeedbackVisible" AS "isPublicFeedbackVisible"')
        .addSelect('"pp"."isMentorStatsVisible" AS "isMentorStatsVisible"')
        .addSelect('"pp"."isStudentStatsVisible" AS "isStudentStatsVisible"')
        .leftJoin(User, 'user', '"user"."id" = "pp"."userId"')
        .where('"user"."githubId" = :githubId', { githubId })
        .getRawOne()) || {}
    );
  }

  public async getRelationsRoles(userGithubId: string, requestedGithubId: string): Promise<Relations | null> {
    return (
      (await this.dataSource
        .getRepository(Student)
        .createQueryBuilder('student')
        .select('"userStudent"."githubId" AS "student"')
        .addSelect('ARRAY_AGG("userMentor"."githubId") as "mentors"')
        .addSelect('ARRAY_AGG("userInterviewer"."githubId") as "interviewers"')
        .addSelect('ARRAY_AGG("userStageInterviewer"."githubId") as "stageInterviewers"')
        .addSelect('ARRAY_AGG("userChecker"."githubId") as "checkers"')
        .leftJoin(User, 'userStudent', '"student"."userId" = "userStudent"."id"')
        .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
        .leftJoin(User, 'userMentor', '"mentor"."userId" = "userMentor"."id"')
        .leftJoin(TaskChecker, 'taskChecker', '"student"."id" = "taskChecker"."studentId"')
        .leftJoin(Mentor, 'mentorChecker', '"mentorChecker"."id" = "taskChecker"."mentorId"')
        .leftJoin(User, 'userChecker', '"mentorChecker"."userId" = "userChecker"."id"')
        .leftJoin(TaskInterviewResult, 'taskInterviewResult', '"student"."id" = "taskInterviewResult"."studentId"')
        .leftJoin(Mentor, 'mentorInterviewer', '"mentorInterviewer"."id" = "taskInterviewResult"."mentorId"')
        .leftJoin(User, 'userInterviewer', '"mentorInterviewer"."userId" = "userInterviewer"."id"')
        .leftJoin(StageInterview, 'stageInterview', '"student"."id" = "stageInterview"."studentId"')
        .leftJoin(Mentor, 'mentorStageInterviewer', '"mentorStageInterviewer"."id" = "stageInterview"."mentorId"')
        .leftJoin(User, 'userStageInterviewer', '"mentorStageInterviewer"."userId" = "userStageInterviewer"."id"')
        .where(
          `"userStudent"."githubId" = :userGithubId AND
      ("userMentor"."githubId" = :requestedGithubId OR
      "userStageInterviewer"."githubId" = :requestedGithubId OR
      "userInterviewer"."githubId" = :requestedGithubId OR
      "userChecker"."githubId" = :requestedGithubId )`,
          { userGithubId, requestedGithubId },
        )
        .orWhere(
          `"userStudent"."githubId" = :requestedGithubId AND
      ("userMentor"."githubId" = :userGithubId OR
      "userStageInterviewer"."githubId" = :userGithubId OR
      "userInterviewer"."githubId" = :userGithubId OR
      "userChecker"."githubId" = :userGithubId)`,
        )
        .groupBy('"userStudent"."githubId"')
        .getRawOne()) || null
    );
  }

  public async getUserInfo(githubId: string, permissions: Permissions): Promise<UserInfo> {
    const {
      isAboutVisible,
      isEducationVisible,
      isEnglishVisible,
      isPhoneVisible,
      isEmailVisible,
      isTelegramVisible,
      isSkypeVisible,
      isContactsNotesVisible,
      isLinkedInVisible,
      isWhatsAppVisible,
    } = permissions;

    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .select('"user"."firstName" AS "firstName", "user"."lastName" AS "lastName"')
      .addSelect('"user"."githubId" AS "githubId"')
      .addSelect('"user"."countryName" AS "countryName"')
      .addSelect('"user"."cityName" AS "cityName"')
      .addSelect('"user"."discord" AS "discord"')
      .addSelect('"user"."languages" AS "languages"');

    if (isEducationVisible) {
      query.addSelect('"user"."educationHistory" AS "educationHistory"');
    }

    if (isEnglishVisible) {
      query.addSelect('"user"."englishLevel" AS "englishLevel"');
    }

    if (isPhoneVisible) {
      query.addSelect('"user"."contactsPhone" AS "contactsPhone"');
    }

    if (isEmailVisible) {
      query
        .addSelect('"user"."contactsEmail" AS "contactsEmail"')
        .addSelect('"user"."contactsEpamEmail" AS "epamEmail"');
    }

    if (isTelegramVisible) {
      query.addSelect('"user"."contactsTelegram" AS "contactsTelegram"');
    }

    if (isSkypeVisible) {
      query.addSelect('"user"."contactsSkype" AS "contactsSkype"');
    }

    if (isWhatsAppVisible) {
      query.addSelect('"user"."contactsWhatsApp" AS "contactsWhatsApp"');
    }

    if (isContactsNotesVisible) {
      query.addSelect('"user"."contactsNotes" AS "contactsNotes"');
    }

    if (isLinkedInVisible) {
      query.addSelect('"user"."contactsLinkedIn" AS "contactsLinkedIn"');
    }

    if (isAboutVisible) {
      query.addSelect('"user"."aboutMyself" AS "aboutMyself"');
    }

    const rawUser = await query.where('"user"."githubId" = :githubId', { githubId }).getRawOne();

    if (rawUser == null) {
      throw new NotFoundException(`User with githubId ${githubId} not found`);
    }

    const isContactsVisible =
      isPhoneVisible || isEmailVisible || isTelegramVisible || isSkypeVisible || isContactsNotesVisible;

    const {
      firstName,
      lastName,
      countryName,
      cityName,
      discord,
      educationHistory = null,
      englishLevel = null,
      contactsPhone = null,
      contactsEmail = null,
      contactsTelegram = null,
      contactsSkype = null,
      contactsWhatsApp = null,
      contactsNotes = null,
      contactsLinkedIn = null,
      aboutMyself = null,
      epamEmail = null,
      languages = [],
    } = rawUser;

    return {
      generalInfo: {
        githubId,
        location: {
          countryName,
          cityName,
        },
        aboutMyself: isAboutVisible ? aboutMyself : undefined,
        educationHistory: isEducationVisible ? educationHistory : undefined,
        englishLevel: isEnglishVisible ? englishLevel : undefined,
        name: getFullName(firstName, lastName, githubId),
        languages,
      },
      discord,
      contacts: isContactsVisible
        ? {
            phone: contactsPhone,
            email: contactsEmail,
            epamEmail,
            skype: contactsSkype,
            telegram: contactsTelegram,
            notes: contactsNotes,
            linkedIn: contactsLinkedIn,
            whatsApp: contactsWhatsApp,
          }
        : undefined,
    } as UserInfo;
  }

  public async getMentorStats(githubId: string): Promise<MentorStats[]> {
    const rawData = await this.dataSource
      .getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select('"course"."name" AS "courseName"')
      .addSelect('"course"."id" AS "courseId"')
      .addSelect('"course"."locationName" AS "courseLocationName"')
      .addSelect('ARRAY_AGG ("userStudent"."githubId") AS "studentGithubIds"')
      .addSelect('ARRAY_AGG ("userStudent"."firstName") AS "studentFirstNames"')
      .addSelect('ARRAY_AGG ("userStudent"."lastName") AS "studentLastNames"')
      .addSelect('ARRAY_AGG ("student"."isExpelled") AS "studentIsExpelledStatuses"')
      .addSelect('ARRAY_AGG ("student"."totalScore") AS "studentTotalScores"')
      .leftJoin(User, 'user', '"user"."id" = "mentor"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "mentor"."courseId"')
      .leftJoin(Student, 'student', '"student"."mentorId" = "mentor"."id"')
      .leftJoin(User, 'userStudent', '"userStudent"."id" = "student"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .groupBy('"course"."id"')
      .orderBy('"course"."endDate"', 'DESC')
      .getRawMany();
    return rawData.map(
      ({
        courseName,
        courseLocationName,
        studentGithubIds,
        studentFirstNames,
        studentLastNames,
        studentIsExpelledStatuses,
        studentTotalScores,
      }) => {
        const students = studentGithubIds[0]
          ? studentGithubIds.map((githubId: string, idx: number) => ({
              githubId,
              name: getFullName(studentFirstNames[idx], studentLastNames[idx], githubId),
              isExpelled: studentIsExpelledStatuses[idx],
              totalScore: studentTotalScores[idx],
            }))
          : undefined;
        return { courseLocationName, courseName, students };
      },
    );
  }

  public async getPublicFeedback(githubId: string): Promise<PublicFeedback[]> {
    return (
      await this.dataSource
        .getRepository(Feedback)
        .createQueryBuilder('feedback')
        .select('"feedback"."updatedDate" AS "feedbackDate"')
        .addSelect('"feedback"."badgeId" AS "badgeId"')
        .addSelect('"feedback"."comment" AS "comment"')
        .addSelect('"fromUser"."firstName" AS "fromUserFirstName", "fromUser"."lastName" AS "fromUserLastName"')
        .addSelect('"fromUser"."githubId" AS "fromUserGithubId"')
        .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
        .leftJoin(User, 'fromUser', '"fromUser"."id" = "feedback"."fromUserId"')
        .where('"user"."githubId" = :githubId', { githubId })
        .orderBy('"feedback"."updatedDate"', 'DESC')
        .getRawMany()
    ).map(({ feedbackDate, badgeId, comment, fromUserFirstName, fromUserLastName, fromUserGithubId }) => ({
      feedbackDate,
      badgeId,
      comment,
      fromUser: {
        name: getFullName(fromUserFirstName, fromUserLastName, fromUserGithubId),
        githubId: fromUserGithubId,
      },
    }));
  }

  public async getStageInterviewFeedback(githubId: string): Promise<StageInterviewDetailedFeedback[]> {
    const data = await this.dataSource
      .getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .select('"stageInterview"."decision" AS "decision"')
      .addSelect('"stageInterview"."isGoodCandidate" AS "isGoodCandidate"')
      .addSelect('"stageInterview"."score" AS "interviewScore"')
      .addSelect('"course"."name" AS "courseName"')
      .addSelect('"course"."fullName" AS "courseFullName"')
      .addSelect('"stageInterviewFeedback"."json" AS "interviewResultJson"')
      .addSelect('"stageInterviewFeedback"."updatedDate" AS "interviewFeedbackDate"')
      .addSelect('"stageInterviewFeedback"."version" AS "feedbackVersion"')
      .addSelect('"userMentor"."firstName" AS "interviewerFirstName"')
      .addSelect('"userMentor"."lastName" AS "interviewerLastName"')
      .addSelect('"userMentor"."githubId" AS "interviewerGithubId"')
      .addSelect('"courseTask"."maxScore" AS "maxScore"')
      .leftJoin(Student, 'student', '"student"."id" = "stageInterview"."studentId"')
      .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "stageInterview"."courseId"')
      .leftJoin(
        StageInterviewFeedback,
        'stageInterviewFeedback',
        '"stageInterview"."id" = "stageInterviewFeedback"."stageInterviewId"',
      )
      .leftJoin(CourseTask, 'courseTask', '"courseTask"."id" = "stageInterview"."courseTaskId"')
      .leftJoin(Mentor, 'mentor', '"mentor"."id" = "stageInterview"."mentorId"')
      .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .andWhere('"stageInterview"."isCompleted" = true')
      .orderBy('"course"."updatedDate"', 'ASC')
      .getRawMany();

    return data
      .map(rawData => {
        const {
          feedbackVersion,
          decision,
          interviewFeedbackDate,
          interviewerFirstName,
          courseFullName,
          courseName,
          interviewerLastName,
          interviewerGithubId,
          isGoodCandidate,
          interviewScore,
          interviewResultJson,
          maxScore,
        } = rawData;
        const feedbackTemplate = JSON.parse(interviewResultJson) as StageInterviewFeedbackJson;

        const { score, feedback } = !feedbackVersion
          ? parseLegacyFeedback(feedbackTemplate)
          : {
              feedback: feedbackTemplate,
              score: interviewScore ?? 0,
            };

        return {
          version: feedbackVersion ?? 0,
          date: interviewFeedbackDate,
          decision,
          isGoodCandidate,
          courseName,
          courseFullName,
          feedback,
          score,
          interviewer: {
            name: getFullName(interviewerFirstName, interviewerLastName, interviewerGithubId),
            githubId: interviewerGithubId,
          },
          maxScore,
        };
      })
      .filter(Boolean) as StageInterviewDetailedFeedback[];
  }

  public async getStudentStats(githubId: string, permissions: Permissions): Promise<StudentStats[]> {
    const { isCoreJsFeedbackVisible, isExpellingReasonVisible } = permissions;

    const query = this.dataSource
      .getRepository(Student)
      .createQueryBuilder('student')
      .select('"course"."id" AS "courseId"')
      .addSelect('"course"."name" AS "courseName"')
      .addSelect('"course"."locationName" AS "locationName"')
      .addSelect('"course"."fullName" AS "courseFullName"')
      .addSelect('"course"."completed" AS "isCourseCompleted"')
      .addSelect('"student"."isExpelled" AS "isExpelled"')
      .addSelect('"student"."totalScore" AS "totalScore"')
      .addSelect('"student"."rank" AS "rank"')
      .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
      .addSelect('"userMentor"."lastName" AS "mentorLastName"')
      .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
      .addSelect('"certificate"."publicId" AS "certificateId"')
      .addSelect('ARRAY_AGG ("courseTask"."maxScore") AS "taskMaxScores"')
      .addSelect('ARRAY_AGG ("courseTask"."scoreWeight") AS "taskScoreWeights"')
      .addSelect('ARRAY_AGG ("courseTask"."studentEndDate") AS "taskEndDates"')
      .addSelect('ARRAY_AGG ("task"."name") AS "taskNames"')
      .addSelect('ARRAY_AGG ("task"."descriptionUrl") AS "taskDescriptionUris"')
      .addSelect('ARRAY_AGG ("taskResult"."githubPrUrl") AS "taskGithubPrUris"').addSelect(`ARRAY_AGG (COALESCE(
      "taskResult"."score",
      "taskInterview"."score",
      ("stageInterviewFeedback"."json"::json -> 'steps' -> 'decision' -> 'values' ->> 'finalScore')::int
    )) AS "taskScores"`);

    query.addSelect('"student"."expellingReason" AS "expellingReason"');

    if (isCoreJsFeedbackVisible) {
      query
        .addSelect('ARRAY_AGG (COALESCE("taskResult"."comment", "taskInterview"."comment")) AS "taskComments"')
        .addSelect('ARRAY_AGG ("taskInterview"."formAnswers") AS "taskInterviewFormAnswers"')
        .addSelect('ARRAY_AGG ("taskInterview"."createdDate") AS "taskInterviewDate"')
        .addSelect('ARRAY_AGG ("interviewer"."githubId") AS "interviewerGithubId"')
        .addSelect('ARRAY_AGG ("interviewer"."firstName") AS "interviewerFirstName"')
        .addSelect('ARRAY_AGG ("interviewer"."lastName") AS "interviewerLastName"');
    } else {
      query.addSelect('ARRAY_AGG ("taskResult"."comment") AS "taskComments"');
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
      )
      .leftJoin(
        StageInterview,
        'stageInterview',
        '"stageInterview"."studentId" = "student"."id" AND "stageInterview"."courseTaskId" = "courseTask"."id"',
      )
      .leftJoin(
        StageInterviewFeedback,
        'stageInterviewFeedback',
        '"stageInterviewFeedback"."stageInterviewId" = "stageInterview"."id"',
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
        taskEndDates,
        taskNames,
        taskDescriptionUris,
        taskGithubPrUris,
        taskScores,
        taskComments,
        taskInterviewFormAnswers,
        taskInterviewDate,
        interviewerGithubId,
        interviewerFirstName,
        interviewerLastName,
        certificateId,
        rank,
      }) => {
        const tasksWithDates = taskMaxScores.map((maxScore: number, idx: number) => ({
          maxScore,
          endDate: new Date(taskEndDates[idx]).getTime(),
          scoreWeight: taskScoreWeights[idx],
          name: taskNames[idx],
          descriptionUri: taskDescriptionUris[idx],
          githubPrUri: taskGithubPrUris[idx],
          score: taskScores[idx],
          comment: taskComments[idx],
          interviewFormAnswers: (taskInterviewFormAnswers && taskInterviewFormAnswers[idx]) || undefined,
          interviewDate: taskInterviewDate && taskInterviewDate[idx] ? String(taskInterviewDate[idx]) : undefined,
          interviewer:
            interviewerGithubId && interviewerGithubId[idx]
              ? {
                  name: getFullName(interviewerFirstName[idx], interviewerLastName[idx], interviewerGithubId[idx]),
                  githubId: interviewerGithubId[idx],
                }
              : undefined,
        }));
        const orderedTasks = tasksWithDates
          .sort((a: { endDate: number }, b: { endDate: number }) => a.endDate - b.endDate)
          .map((task: object) => omit(task, 'endDate'));
        return {
          courseId,
          courseName,
          locationName,
          courseFullName,
          isExpelled,
          expellingReason: isExpellingReasonVisible ? expellingReason : undefined,
          isSelfExpelled: (expellingReason as string)?.startsWith(SELF_EXPELLED_MARK),
          isCourseCompleted,
          totalScore,
          tasks: orderedTasks,
          certificateId,
          rank,
          mentor: {
            githubId: mentorGithubId,
            name: getFullName(mentorFirstName, mentorLastName, mentorGithubId),
          },
        };
      },
    ) as StudentStats[];
  }
}

// this is legacy form
function parseLegacyFeedback(interviewResult: StageInterviewFeedbackJson) {
  const { english, programmingTask, resume } = interviewResult;
  const { rating, htmlCss, common, dataStructures } = getInterviewRatings(interviewResult);

  return {
    score: rating,
    feedback: {
      english: english.levelMentorOpinion ? english.levelMentorOpinion : english.levelStudentOpinion,
      programmingTask,
      comment: resume.comment,
      skills: {
        htmlCss,
        common,
        dataStructures,
      },
    },
  };
}
