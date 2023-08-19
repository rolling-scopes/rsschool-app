import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as _ from 'lodash';

import { Student } from '@entities/student';

import { paginate } from '../../core/paginate';
import { MentorsService } from '../../courses/mentors';

import { orderByFieldMapping, OrderDirection, OrderField, ScoreQueryDto } from './dto/score-query.dto';
import { InterviewsService } from '../interviews';
import { ScoreDto, ScoreStudentDto } from './dto/score.dto';
import { TaskResult } from '@entities/taskResult';

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
  ) {}

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

    const students = studentsContent.map(student => {
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
    });

    return new ScoreDto(students, paginationMeta);
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
    let query = this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(this.getPrimaryUserFields())
      .leftJoin('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
      .addSelect(['mentor.id', 'mentor.userId'])
      .leftJoin('student.taskResults', 'tr')
      .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask'])
      .leftJoin('tr.courseTask', 'ct')
      .addSelect(['ct.disabled', 'ct.id'])
      .leftJoin('student.taskInterviewResults', 'tir')
      .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate'])
      .leftJoin('mentor.user', 'mu')
      .addSelect(this.getPrimaryUserFields('mu'))
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

  private getPrimaryUserFields = (modelName = 'user') => [
    `${modelName}.id`,
    `${modelName}.firstName`,
    `${modelName}.lastName`,
    `${modelName}.githubId`,
    `${modelName}.cityName`,
    `${modelName}.countryName`,
    `${modelName}.discord`,
  ];
}
