import * as Router from 'koa-router';
import { OK, BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User, Student } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';
import { OperationResult, userService } from '../../services';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
};

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .where('course.id = :courseId', {
      courseId,
    })
    .getMany();

  const response = students.map<StudentDTO>(student => ({
    studentId: student.id,
    firstName: (student.user as User).firstName,
    lastName: (student.user as User).lastName,
    githubId: (student.user as User).githubId,
  }));

  setResponse(ctx, OK, response);
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
    if (user == null) {
      result.push({
        status: 'skipped',
        value: item.githubId,
      });
      continue;
    }

    const exists =
      (await studentRepository
        .createQueryBuilder('student')
        .innerJoinAndSelect('student.user', 'user')
        .innerJoinAndSelect('student.course', 'course')
        .where('user.id = :userId AND course.id = :courseId', {
          userId: user.id,
          courseId,
        })
        .getCount()) > 0;

    if (exists) {
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
