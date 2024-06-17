import { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Permissions } from './dto/permissions.dto';
import { StudentStats } from '@common/models';
import {
  Certificate,
  Course,
  CourseTask,
  Mentor,
  StageInterview,
  StageInterviewFeedback,
  Student,
  Task,
  TaskInterviewResult,
  TaskResult,
  User,
} from '@entities/index';

@Injectable()
export class StudentInfoService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private userService: UsersService,
  ) {}

  async getCourses(githubId: string): Promise<{ courseId: number }[] | null> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('"student"."courseId" AS "courseId"')
      .leftJoin(Student, 'student', '"student"."userId" = "user"."id"')
      .where('"user"."githubId" = :githubId', { githubId })
      .getRawMany();

    return result ?? null;
  }

  async getStats(githubId: string, permissions: Permissions): Promise<StudentStats[]> {
    const { isCoreJsFeedbackVisible, isExpellingReasonVisible } = permissions;

    const query = await this.studentRepository
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
        ("stageInterviewFeedback"."json"::json -> 'resume' ->> 'score')::int
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
      }: any) => {
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
                  name:
                    this.userService.getFullName({
                      firstName: interviewerFirstName[idx],
                      lastName: interviewerLastName[idx],
                    }) || interviewerGithubId[idx],
                  githubId: interviewerGithubId[idx],
                }
              : undefined,
        }));
        const orderedTasks = tasksWithDates
          .sort((a: any, b: any) => a.endDate - b.endDate)
          .map((task: any) => omit(task, 'endDate'));
        return {
          courseId,
          courseName,
          locationName,
          courseFullName,
          isExpelled,
          expellingReason: isExpellingReasonVisible ? expellingReason : undefined,
          isSelfExpelled: (expellingReason as string)?.startsWith('Self expelled from the course'),
          isCourseCompleted,
          totalScore,
          tasks: orderedTasks,
          certificateId,
          rank,
          mentor: {
            githubId: mentorGithubId,
            name:
              this.userService.getFullName({ firstName: mentorFirstName, lastName: mentorLastName }) || mentorGithubId,
          },
        };
      },
    );
  }
}
