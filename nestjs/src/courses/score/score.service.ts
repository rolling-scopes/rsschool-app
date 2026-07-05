import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';

import { Student } from '@entities/student';
import { CourseTask } from '@entities/courseTask';
import { ConfigService } from 'src/config';
import { exportStageInterviewRating } from './export-helpers';

import { paginate } from '../../core/paginate';
import { MentorsService } from '../../courses/mentors';

import { orderByFieldMapping, OrderDirection, OrderField, ScoreQueryDto } from './dto/score-query.dto';
import { InterviewsService } from '../interviews';
import { ScoreDto, ScoreStudentDto } from './dto/score.dto';
import { TaskResult } from '@entities/taskResult';
import { Mentor } from '@entities/mentor';
import { UsersService } from 'src/users/users.service';

const defaultFilter: Partial<ScoreQueryDto> = {
  activeOnly: 'false',
  githubId: '',
  name: '',
  'mentor.githubId': '',
  cityName: '',
};

const defaultOrder: { field: OrderField; direction: OrderDirection } = {
  field: 'rank',
  direction: 'asc',
};

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,

    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  public async getStudentsScoreForExport(
    courseId: number,
    filters: { activeOnly: boolean; cityName?: string; 'mentor.githubId'?: string },
    options: { includeContacts: boolean; includeCertificate: boolean },
  ) {
    const students = await this.getStudentsScoreRaw(courseId, filters, options);
    const courseTasks = await this.dataSource
      .getRepository(CourseTask)
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .where('courseTask.courseId = :courseId', { courseId })
      .andWhere('courseTask.disabled = :disabled', { disabled: false })
      .getMany();

    return students.map(student => {
      return {
        githubId: student.githubId,
        name: student.name,
        cvLink: student.cvLink,
        locationName: student.cityName,
        countryName: student.countryName || 'Other',
        mentorGithubId: student.mentor ? student.mentor.githubId : '',
        totalScore: student.totalScore,
        isActive: student.isActive,
        contacts: student.contacts,
        hasCertificate: student.hasCertificate,
        ...ScoreService.getTasksResults(student.taskResults, courseTasks),
      };
    });
  }

  private async getStudentsScoreRaw(
    courseId: number,
    filter: { activeOnly: boolean; cityName?: string; 'mentor.githubId'?: string; name?: string; githubId?: string },
    options: { includeContacts: boolean; includeCertificate: boolean },
  ) {
    let query = this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(
        ScoreService.getExportPrimaryUserFields().concat(
          options.includeContacts ? ScoreService.getExportContactsUserFields() : [],
        ),
      )
      .leftJoin('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
      .leftJoin('user.resume', 'resume')
      .addSelect(['resume.uuid', 'resume.userId'])
      .addSelect(['mentor.id', 'mentor.userId'])
      .leftJoin('student.taskResults', 'tr')
      .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask'])
      .leftJoin('tr.courseTask', 'ct')
      .addSelect(['ct.disabled', 'ct.id'])
      .leftJoin('student.taskInterviewResults', 'tir')
      .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate'])
      .leftJoin('mentor.user', 'mu')
      .addSelect(ScoreService.getExportPrimaryUserFields('mu'))
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect([
        'sif.stageInterviewId',
        'sif.json',
        'sif.updatedDate',
        'si.isCompleted',
        'si.id',
        'si.courseTaskId',
        'si.score',
      ])
      .where('student."courseId" = :courseId', { courseId });

    if (options.includeCertificate) {
      query = query.leftJoin('student.certificate', 'certificate').addSelect('certificate.id');
    }
    if (filter.activeOnly) {
      query = query.andWhere('student."isFailed" = false').andWhere('student."isExpelled" = false');
    }

    if (filter.cityName) {
      query = query.andWhere('"user"."cityName" ILIKE :searchCityNameText', {
        searchCityNameText: `%${filter.cityName}%`,
      });
    }

    if (filter['mentor.githubId']) {
      query = query.andWhere('"mu"."githubId" ILIKE :searchMentorGithubIdText', {
        searchMentorGithubIdText: `%${filter['mentor.githubId']}%`,
      });
    }

    const content = await query.orderBy('student.rank', 'ASC').getMany();

    return content.map(student => {
      const stageInterviews = student.stageInterviews ?? [];
      const preScreeningScore = Math.floor(exportStageInterviewRating(stageInterviews) ?? 0);
      const preScreningInterviews = stageInterviews.length
        ? [{ score: preScreeningScore, courseTaskId: stageInterviews[0]!.courseTaskId }]
        : [];

      const user = student.user;

      const resumeUuid = student.user.resume?.find(r => r.userId === user.id)?.uuid;
      const cvLink = resumeUuid ? `${this.configService.host}/cv/${resumeUuid}` : '';

      const interviews = _.values(_.groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
        .map(arr => _.first(_.orderBy(arr, 'updatedDate', 'desc'))!)
        .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));

      let taskResults =
        student.taskResults
          ?.filter(({ courseTask: { disabled } }) => !disabled)
          .map(({ courseTaskId, score }) => ({ courseTaskId, score }))
          .concat(interviews) ?? [];

      // we have a case when technical screening score are set as task result.
      taskResults = taskResults.concat(
        preScreningInterviews.filter(i => !taskResults.find(tr => tr.courseTaskId === i.courseTaskId)),
      );

      const mentorUser = student.mentor?.user;
      return {
        id: student.id,
        rank: student.rank,
        cvLink,
        mentor: mentorUser
          ? { githubId: mentorUser.githubId, name: ScoreService.buildExportName(mentorUser) }
          : undefined,
        name: ScoreService.buildExportName(user),
        githubId: user.githubId,
        totalScore: student.totalScore,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? 'Other',
        taskResults,
        isActive: !student.isExpelled && !student.isFailed,
        contacts: options.includeContacts
          ? {
              epamEmail: user.contactsEpamEmail,
              email: user.primaryEmail || user.contactsEmail,
              linkedIn: user.contactsLinkedIn,
              telegram: user.contactsTelegram,
            }
          : null,
        hasCertificate: options.includeCertificate ? !!student.certificate?.id : undefined,
      };
    });
  }

  private static getTasksResults(results: { courseTaskId: number; score: number }[], courseTasks: CourseTask[]) {
    return courseTasks.reduce(
      (acc, courseTask) => {
        const result = results.find(r => r.courseTaskId === courseTask.id);
        const { name } = courseTask.task;
        acc[name] = result?.score ?? 0;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private static getExportPrimaryUserFields(modelName = 'user') {
    return [
      `${modelName}.id`,
      `${modelName}.firstName`,
      `${modelName}.lastName`,
      `${modelName}.githubId`,
      `${modelName}.cityName`,
      `${modelName}.countryName`,
      `${modelName}.discord`,
    ];
  }

  private static getExportContactsUserFields(modelName = 'user') {
    return [
      `${modelName}.primaryEmail`,
      `${modelName}.contactsPhone`,
      `${modelName}.contactsEmail`,
      `${modelName}.contactsTelegram`,
      `${modelName}.contactsLinkedIn`,
      `${modelName}.contactsSkype`,
      `${modelName}.contactsEpamEmail`,
    ];
  }

  private static buildExportName({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
  }

  public async getStudentForScore(courseId: number, githubId: string) {
    return this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
  }

  public async getCourseTaskWithCourse(courseTaskId: number) {
    return this.dataSource
      .getRepository(CourseTask)
      .createQueryBuilder('courseTask')
      .innerJoinAndSelect('courseTask.task', 'task')
      .innerJoinAndSelect('courseTask.course', 'course')
      .where('courseTask.id = :courseTaskId', { courseTaskId })
      .getOne();
  }

  public async getMentorByUserId(courseId: number, userId: number) {
    return this.dataSource
      .getRepository(Mentor)
      .createQueryBuilder('mentor')
      .where('mentor."userId" = :userId', { userId })
      .andWhere('mentor."courseId" = :courseId', { courseId })
      .getOne();
  }

  public async getScore({
    filter = defaultFilter,
    orderBy = defaultOrder,
    page,
    limit,
    courseId,
  }: {
    filter: Partial<ScoreQueryDto>;
    orderBy: { field: OrderField; direction: OrderDirection };
    page: number;
    limit: number;
    courseId: number;
  }) {
    const query = this.buildScoreQuery({ filter, orderBy, courseId });
    const { items: studentsContent, meta: paginationMeta } = await paginate(query, { page, limit });
    const students = studentsContent.map(student => this.convertToScoreStudentDto(student));

    return new ScoreDto(students, paginationMeta);
  }

  public async getStudentScore({ courseId, githubId }: { courseId: number; githubId: string }) {
    const studentScoreContent = await this.buildBasicScoreQuery({ courseId })
      .andWhere('"user"."githubId" = :githubId', { githubId })
      .getOne();

    const studentScore = studentScoreContent ? this.convertToScoreStudentDto(studentScoreContent) : null;

    return studentScore;
  }

  private buildScoreQuery({
    filter,
    orderBy,
    courseId,
  }: {
    filter: Partial<ScoreQueryDto>;
    orderBy: { field: OrderField; direction: OrderDirection };
    courseId: number;
  }) {
    let query = this.buildBasicScoreQuery({ courseId });

    if (filter.activeOnly === 'true') {
      query = query.andWhere('student."isFailed" = false').andWhere('student."isExpelled" = false');
    }

    if (filter.name) {
      query = query.andWhere('("user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText)', {
        searchText: `%${filter.name}%`,
      });
    }

    if (filter.cityName) {
      query = query.andWhere('"user"."cityName" ILIKE :searchCityNameText', {
        searchCityNameText: `%${filter.cityName}%`,
      });
    }

    if (filter['mentor.githubId']) {
      query = query.andWhere('"mu"."githubId" ILIKE :searchMentorGithubIdText', {
        searchMentorGithubIdText: `%${filter['mentor.githubId']}%`,
      });
    }

    if (filter.githubId) {
      query = query.andWhere('("user"."githubId" ILIKE :searchGithubIdText)', {
        searchGithubIdText: `%${filter.githubId}%`,
      });
    }

    return query.orderBy(
      orderByFieldMapping[orderBy.field],
      orderBy.direction.toUpperCase() as Uppercase<OrderDirection>,
    );
  }

  private buildBasicScoreQuery({ courseId }: { courseId: number }) {
    return this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(UsersService.getPrimaryUserFields())
      .leftJoin('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
      .addSelect(['mentor.id', 'mentor.userId'])
      .leftJoin('student.taskResults', 'tr')
      .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask'])
      .leftJoin('tr.courseTask', 'ct')
      .addSelect(['ct.disabled', 'ct.id'])
      .leftJoin('student.taskInterviewResults', 'tir')
      .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate'])
      .leftJoin('mentor.user', 'mu')
      .addSelect(UsersService.getPrimaryUserFields('mu'))
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect([
        'sif.stageInterviewId',
        'sif.json',
        'sif.updatedDate',
        'si.isCompleted',
        'si.id',
        'si.courseTaskId',
        'si.score',
      ])
      .where('student."courseId" = :courseId', { courseId });
  }

  private convertToScoreStudentDto(student: Student) {
    const [preScreeningInterview] = student.stageInterviews ?? [];

    const preScreeningScore = Math.floor(
      InterviewsService.getLastStageInterview(student.stageInterviews ?? [])?.rating ?? 0,
    );
    const preScreeningInterviewWithScore = preScreeningInterview
      ? { score: preScreeningScore, courseTaskId: preScreeningInterview.courseTaskId }
      : undefined;

    const user = student.user;
    const interviews = _.values(_.groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
      .map(arr => _.orderBy(arr, 'updatedDate', 'desc')[0]!)
      .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));

    const taskResults =
      student.taskResults
        ?.filter(({ courseTask: { disabled } }) => !disabled)
        .map(({ courseTaskId, score }) => ({ courseTaskId, score }))
        .concat(interviews) ?? [];

    // we have a case when technical screening score are set as task result.
    if (
      preScreeningInterviewWithScore &&
      !taskResults.find(tr => tr.courseTaskId === preScreeningInterviewWithScore.courseTaskId)
    ) {
      taskResults.push(preScreeningInterviewWithScore);
    }

    const mentor = student.mentor ? MentorsService.convertMentorToMentorBasic(student.mentor) : undefined;
    return new ScoreStudentDto(student, user, mentor, taskResults, undefined);
  }
}
