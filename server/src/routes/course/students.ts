import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { courseService, OperationResult, studentsService, userService } from '../../services';
import { setResponse } from '../utils';

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const status: string = ctx.query.status;
  const students = await courseService.getStudents(courseId, status === 'active');
  setResponse(ctx, OK, students);
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
  for await (const item of data) {
    console.time(item.githubId);

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
