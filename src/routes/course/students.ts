import * as Router from 'koa-router';
import { OK, BAD_REQUEST, NOT_FOUND } from 'http-status-codes';
import { ILogger } from '../../logger';
import { User, Student } from '../../models';
import { getRepository } from 'typeorm';
import { setResponse } from '../utils';

type StudentDTO = {
  firstName: string;
  lastName: string;
  githubId: string;
  studentId: number;
};

export const getStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId = Number(ctx.params.courseId);

  const students = await getRepository(Student).find({ where: { courseId }, relations: ['user'] });

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

  const userRepository = getRepository(User);
  const studentRepository = getRepository(Student);

  if (data === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  for await (const item of data) {
    console.time(item.githubId);

    const user = await userRepository.findOne({ where: { githubId: item.githubId } });
    if (user == null) {
      continue;
    }

    const exists = (await studentRepository.count({ where: { user, courseId } })) > 0;
    if (exists) {
      continue;
    }

    const { githubId, ...restData } = item;
    const student = { ...restData, user, course: courseId };
    await studentRepository.save(student);

    console.timeEnd(item.githubId);
  }

  setResponse(ctx, OK, data);
};
