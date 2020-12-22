import { IPaginationOptions, paginate } from 'koa-typeorm-pagination';
import _ from 'lodash';
import { getRepository } from 'typeorm';
import { ScoreTableFilters } from '../../../common/types/score';
import { Student } from '../models';
import { createName } from './user.service';
import { getPrimaryUserFields, convertToMentorBasic } from './course.service';

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

export async function getStudentsScore(
  courseId: number,
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
    .where('student."courseId" = :courseId', { courseId });

  if (filter.activeOnly) {
    query = query.andWhere('student."isFailed" = false').andWhere('student."isExpelled" = false');
  }

  if (filter.name) {
    query = query.andWhere('("user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText)', {
      searchText: `%${filter.name}%`,
    });
  }

  if (filter.cityName) {
    query = query.andWhere('"user"."cityName" ILIKE :searchText', { searchText: `%${filter.cityName}%` });
  }

  if (filter['mentor.githubId']) {
    query = query.andWhere('"mu"."githubId" ILIKE :searchText', { searchText: `%${filter['mentor.githubId']}%` });
  }

  if (filter.githubId) {
    query = query.andWhere('("user"."githubId" ILIKE :searchText)', { searchText: `%${filter.githubId}%` });
  }

  const pagination = await paginate(
    query.orderBy(orderByFieldMapping[orderBy.field], orderBy.direction),
    paginateOptions,
  );

  const students = pagination.content.map(student => {
    const user = student.user;
    const interviews = _.values(_.groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
      .map(arr => _.first(_.orderBy(arr, 'updatedDate', 'desc'))!)
      .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));
    const taskResults =
      student.taskResults
        ?.filter(({ courseTask: { disabled } }) => !disabled)
        .map(({ courseTaskId, score }) => ({ courseTaskId, score }))
        .concat(interviews) ?? [];

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
