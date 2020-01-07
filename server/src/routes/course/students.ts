import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { User, Student } from '../../models';
import { courseService, OperationResult, studentsService, userService } from '../../services';
import { setResponse } from '../utils';

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudents(courseId, status === 'active');
  setResponse(ctx, OK, students);
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

    const existingStudent = await studentsService.getCourseStudent(courseId, user.id);
    if (existingStudent) {
      result.push({ status: 'skipped', value: `exists already: ${item.githubId}` });
      continue;
    }

    const { githubId, ...restData } = item;
    const student: Partial<Student> = { ...restData, user, courseId };
    const savedStudent = await studentRepository.save(student);
    result.push({ status: 'created', value: savedStudent.id });

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, result);
};
