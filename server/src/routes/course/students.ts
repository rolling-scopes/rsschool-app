import { OK } from 'http-status-codes';
import { parseAsync } from 'json2csv';
import Router from '@koa/router';
import { getCustomRepository } from 'typeorm';
import { MentorBasic } from '../../../../common/models';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setCsvResponse, setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student.repository';

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
  const { onlyStudentsWithoutMentorShown } = ctx.query;

  const repository = getCustomRepository(StudentRepository);
  const result = await repository.search(Number(courseId), searchText, onlyStudentsWithoutMentorShown === 'true');

  setResponse(ctx, OK, result);
};


