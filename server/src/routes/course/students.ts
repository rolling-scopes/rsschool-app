import { NOT_FOUND, OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { getRepository } from 'typeorm';
import { MentorBasic } from '../../../../common/models';
import { ILogger } from '../../logger';
import { Student, User } from '../../models';
import { courseService, OperationResult, userService } from '../../services';
import { setCsvResponse, setResponse } from '../utils';

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudents(courseId, status === 'active');
  setResponse(ctx, OK, students);
};

export const getStudentsCsv = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudents(courseId, status === 'active');
  const csv = await parseAsync(
    students.map(student => ({
      id: student.id,
      githubId: student.githubId,
      name: student.name,
      isActive: student.isActive,
      mentorName: (student.mentor as MentorBasic)?.name,
      mentorGithubId: (student.mentor as MentorBasic)?.githubId,
      totalScore: student.totalScore,
      city: student.cityName,
      country: student.countryName,
      repository: student.repository,
    })),
  );
  setCsvResponse(ctx, OK, csv, 'students');
};

export const getStudentsWithDetails = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudentsWithDetails(courseId, status === 'active');
  setResponse(ctx, OK, students);
};

export const searchCourseStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const searchText = `${String(ctx.params.searchText)}%`;

  const entities = await getRepository(Student)
    .createQueryBuilder('student')
    .select(
      `"student"."id" AS "id",
      "user"."githubId" AS "githubId",
      "user"."firstName" AS "firstName",
      "user"."lastName" AS "lastName"`,
    )
    .leftJoin(User, 'user', '"student"."userId" = "user"."id"')
    .where(
      `"student"."courseId" = :courseId
      AND "student"."isExpelled" = false
      AND ("user"."githubId" ILIKE :searchText
        OR "user"."firstName" ILIKE :searchText
        OR "user"."lastName" ILIKE :searchText)
    `,
      { courseId, searchText },
    )
    .limit(20)
    .getRawMany();

  const result = entities.map(entity => ({
    id: entity.id,
    githubId: entity.githubId,
    name: `${entity.firstName} ${entity.lastName}`,
  }));

  setResponse(ctx, OK, result, 60);
};

type StudentInput = {
  githubId: string;
  isExpelled: boolean;
  expellingReason: string;
  readyFullTime: boolean;
};

export const postStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: StudentInput[] = ctx.request.body;

  const studentRepository = getRepository(Student);

  if (data == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];
  for (const item of data) {
    const user = await userService.getUserByGithubId(item.githubId);
    if (user == null || user.id == null) {
      result.push({ status: 'skipped', value: `no user: ${item.githubId}` });
      continue;
    }

    const existingStudent = await courseService.queryStudentByGithubId(courseId, item.githubId);
    if (existingStudent) {
      result.push({ status: 'skipped', value: `exists already: ${item.githubId}` });
      continue;
    }

    const { githubId, ...restData } = item;
    const student: Partial<Student> = { ...restData, userId: user.id, courseId };
    const savedStudent = await studentRepository.save(student);
    result.push({ status: 'created', value: savedStudent.id });

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, result);
};
