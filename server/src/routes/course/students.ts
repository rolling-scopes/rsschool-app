import { NOT_FOUND, OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { getRepository, getCustomRepository } from 'typeorm';
import { MentorBasic } from '../../../../common/models';
import { ILogger } from '../../logger';
import { Student } from '../../models';
import { courseService, OperationResult, userService } from '../../services';
import { setCsvResponse, setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student';

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

export const searchStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, searchText } = ctx.params;

  const repository = getCustomRepository(StudentRepository);
  const result = await repository.search(courseId, searchText);

  setResponse(ctx, OK, result);
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
