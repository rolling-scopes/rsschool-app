import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository, getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { courseService, OperationResult, userService } from '../../services';
import { setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student.repository';

type StudentInput = {
  githubId: string;
  isExpelled: boolean;
  expellingReason: string;
  readyFullTime: boolean;
};

export const updateStatuses = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: {
    criteria: { courseTaskIds?: number[]; minScore?: number };
    options: { keepWithMentor?: boolean };
    expellingReason: string;
  } = ctx.request.body;

  if (data == null || data.expellingReason == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const studentRepository = getCustomRepository(StudentRepository);
  const students = await studentRepository.findForExpel(
    courseId,
    {
      courseTaskIds: data.criteria.courseTaskIds ?? [],
      minScore: data.criteria.minScore != null ? Number(data.criteria.minScore) : null,
    },
    data.options,
  );
  await studentRepository.save(
    students.map(({ id }) => ({ id, isExpelled: true, endDate: new Date(), expellingReason: data.expellingReason })),
  );

  setResponse(ctx, OK);
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
  }

  setResponse(ctx, OK, result);
};
