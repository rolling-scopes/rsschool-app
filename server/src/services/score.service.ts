import { IPaginationOptions, paginate } from 'koa-typeorm-pagination';
import _ from 'lodash';
import { getRepository } from 'typeorm';
import { ScoreTableFilters } from '../../../common/types/score';
import { Course, Student } from '../models';
import { createName } from './user.service';
import { getPrimaryUserFields, convertToMentorBasic } from './course.service';
import { getCourseTasks, updateScoreStudents, getCourses } from './course.service';
import { getStageInterviewRating } from './stageInterview.service';
import { round, mapValues, keyBy, sum } from 'lodash';
import { ILogger } from '../logger';

const orderByFieldMapping = {
  rank: 'student.rank',
  totalScore: 'student.totalScore',
  crossCheckScore: 'student.crossCheckScore',
  githubId: 'user.githubId',
  name: 'user.firstName',
  cityName: 'user.cityName',
  mentor: 'mu.githubId',
  totalScoreChangeDate: 'student.totalScoreChangeDate',
  repositoryLastActivityDate: 'student.repositoryLastActivityDate',
};

export class ScoreService {
  constructor(private courseId: number) {}

  public static async recalculateTotalScore(logger: ILogger, coursesToUpdate?: Course[]) {
    const courses = coursesToUpdate ?? (await getCourses());

    for (const course of courses) {
      const start = Date.now();
      logger.info({ msg: `Updating course score`, course: course.name });

      const courseId = course.id;
      const dataStart = Date.now();
      const service = new ScoreService(courseId);
      const [students, courseTasks] = await Promise.all([service.getStudentsScore(), getCourseTasks(courseId)]);
      logger.info({ msg: `Loaded course score`, course: course.name, duration: Date.now() - dataStart });
      const weightMap = mapValues(keyBy(courseTasks, 'id'), 'scoreWeight');
      const crossCheckTaskIds = courseTasks.filter(({ checker }) => checker === 'crossCheck').map(({ id }) => id);

      const calculateScore = (t: { courseTaskId: number; score: number }) => t.score * (weightMap[t.courseTaskId] ?? 1);

      const scores = students.content
        .map(({ id, rank, taskResults, totalScore, crossCheckScore, totalScoreChangeDate }) => {
          const score = sum(taskResults.map(calculateScore));

          const newCrossCheckScore = round(
            sum(taskResults.filter(t => crossCheckTaskIds.includes(t.courseTaskId)).map(calculateScore)),
            1,
          );
          const newTotalScore = round(score, 1);
          const scoreChanged = totalScore !== newTotalScore || crossCheckScore !== newCrossCheckScore;
          return {
            id,
            rank,
            changed: scoreChanged,
            crossCheckScore: newCrossCheckScore,
            totalScore: newTotalScore,
            totalScoreChangeDate: scoreChanged ? new Date() : totalScoreChangeDate,
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore) // ['desc'] by totalScore
        .map((it, i) => ({
          ...it,
          rank: i + 1,
          changed: it.changed || it.rank != i + 1,
        }))
        .filter(it => it.changed)
        .map(({ changed, ...value }) => value);

      await updateScoreStudents(scores);

      logger.info({
        msg: 'Updated course score',
        course: course.name,
        itemsCounts: scores.length,
        duration: Date.now() - start,
      });
    }
  }

  public async getStudentsScore(
    paginateOptions: IPaginationOptions = {
      current: 1,
      pageSize: 1e9,
    },
    filter: ScoreTableFilters = {
      activeOnly: false,
      githubId: '',
      name: '',
      'mentor.githubId': '',
      cityName: '',
    },
    orderBy: { field: keyof typeof orderByFieldMapping; direction: 'ASC' | 'DESC' } = {
      field: 'totalScore',
      direction: 'DESC',
    },
  ) {
    let query = getRepository(Student)
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(getPrimaryUserFields())
      .leftJoin('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
      .addSelect(['mentor.id', 'mentor.userId'])
      .leftJoin('student.taskResults', 'tr')
      .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask'])
      .leftJoin('tr.courseTask', 'ct')
      .addSelect(['ct.disabled', 'ct.id'])
      .leftJoin('student.taskInterviewResults', 'tir')
      .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate'])
      .leftJoin('mentor.user', 'mu')
      .addSelect(getPrimaryUserFields('mu'))
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect(['sif.stageInterviewId', 'sif.json', 'sif.updatedDate', 'si.isCompleted', 'si.id', 'si.courseTaskId'])
      .where('student."courseId" = :courseId', { courseId: this.courseId });

    if (filter.activeOnly) {
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

    const pagination = await paginate(
      query.orderBy(orderByFieldMapping[orderBy.field], orderBy.direction),
      paginateOptions,
    );

    const students = pagination.content.map(student => {
      const preScreeningScore = Math.floor((getStageInterviewRating(student.stageInterviews ?? []) ?? 0) * 10);
      const preScreningInterviews = student.stageInterviews?.length
        ? [{ score: preScreeningScore, courseTaskId: student.stageInterviews[0].courseTaskId }]
        : [];

      const user = student.user;
      const interviews = _.values(_.groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
        .map(arr => _.first(_.orderBy(arr, 'updatedDate', 'desc'))!)
        .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));

      const taskResults =
        student.taskResults
          ?.filter(({ courseTask: { disabled } }) => !disabled)
          .map(({ courseTaskId, score }) => ({ courseTaskId, score }))
          .concat(interviews)
          .concat(preScreningInterviews) ?? [];

      const mentor = student.mentor ? convertToMentorBasic(student.mentor) : undefined;
      return {
        id: student.id,
        rank: student.rank,
        mentor: mentor ? { githubId: mentor.githubId, name: mentor.name } : undefined,
        name: createName(user),
        githubId: user.githubId,
        totalScore: student.totalScore,
        totalScoreChangeDate: student.totalScoreChangeDate,
        crossCheckScore: student.crossCheckScore,
        repositoryLastActivityDate: student.repositoryLastActivityDate,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? 'Other',
        taskResults,
        isActive: !student.isExpelled && !student.isFailed,
      };
    });

    return {
      ...pagination,
      content: students,
    };
  }
}
