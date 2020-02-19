import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import Router from '@koa/router';
import { ILogger } from '../../logger';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import { getUserByGithubId } from '../../services/userService';
import { Mentor, Student } from '../../models';
import { getRepository } from 'typeorm';
import { updateSession } from '../../session';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const mentor = await courseService.getMentorByGithubId(courseId, githubId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const students = await courseService.getStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, students);
};

export const getMentorInterviews = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const mentor = await courseService.getMentorByGithubId(courseId, githubId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const students = await courseService.getStageInterviewStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, students);
};

export const getAllMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const mentor = await courseService.getMentorByGithubId(courseId, githubId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const students = await courseService.getStudentsByMentorId(mentor.id);
  const assignedStudents = await courseService.getAssignedStudentsByMentorId(mentor.id);
  setResponse(ctx, OK, { students, assignedStudents });
};

export const deleteMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.expelMentor(courseId, githubId);
  setResponse(ctx, OK);
};

export const getMentorInterview = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId, courseTaskId } = ctx.params as Params;
  const mentor = await courseService.getMentorByGithubId(courseId, githubId);
  if (mentor == null) {
    setResponse(ctx, NOT_FOUND);
    return;
  }
  const students = await courseService.getInterviewStudentsByMentorId(courseTaskId, mentor.id);
  setResponse(ctx, OK, students);
};

export const postMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;

  const input: { maxStudentsLimit: number; studentsPreference: any; students: number[] } = ctx.request.body;
  const user = await getUserByGithubId(githubId);

  if (user == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const { maxStudentsLimit, studentsPreference } = input;
  const mentor = await getRepository(Mentor).save({
    courseId,
    userId: user.id,
    ...(maxStudentsLimit ? { maxStudentsLimit } : {}),
    ...(studentsPreference ? { studentsPreference } : {}),
  });

  if (input.students.length > 0) {
    await getRepository(Student).update(input.students, { mentorId: mentor.id });
  }

  updateSession(ctx, {
    roles: {
      [courseId]: 'mentor',
    },
  });

  setResponse(ctx, OK);
};
