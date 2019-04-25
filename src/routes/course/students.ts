import * as Router from 'koa-router';
import { OK, BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { OperationResult, userService, studentsService } from '../../services';

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);
  const students = await studentsService.getCourseStudents(courseId);
  setResponse(ctx, OK, students);
};

type StudentInput = {
  githubId: string;
  isExpelled: boolean;
  expellingReason: string;
  readyFullTime: boolean;
};

export const postStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  if (isNaN(courseId)) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const data: StudentInput[] = ctx.request.body;

  const studentRepository = getRepository(Student);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const result: OperationResult[] = [];
  for await (const item of data) {
    console.time(item.githubId);

    const user = await userService.getUserByGithubId(item.githubId);
    if (user == null || user.id == null) {
      result.push({
        status: 'skipped',
        value: item.githubId,
      });
      continue;
    }

    const existingStudent = await studentsService.getCourseStudent(courseId, user.id);
    if (existingStudent) {
      result.push({
        status: 'skipped',
        value: item.githubId,
      });
      continue;
    }

    const { githubId, ...restData } = item;
    const student: Partial<Student> = { ...restData, user, course: courseId };
    const savedStudent = await studentRepository.save(student);
    result.push({
      status: 'created',
      value: savedStudent.id,
    });
    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, result);
};
