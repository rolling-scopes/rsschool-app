import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { IUserSession, Student } from '../../models';
import { courseService } from '../../services';
import { getInterviewsByStudent } from '../../services/stageInterviews';
import { setResponse } from '../utils';

export const postStudentStatus = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const data: { comment?: string; status: 'expelled' | 'active' } = ctx.request.body;

  if (data.status !== 'expelled') {
    throw new Error('Not Supported');
  }

  const { user } = ctx.state as { user: IUserSession };
  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student' });
    return;
  }

  if (!courseService.isPowerUser(courseId, user)) {
    const [interviews, mentor] = await Promise.all([
      getInterviewsByStudent(courseId, student.id),
      courseService.getCourseMentor(courseId, user.id),
    ] as const);
    if (mentor == null) {
      setResponse(ctx, BAD_REQUEST, { message: 'not valid mentor' });
      return;
    }
    if (!interviews.some(it => it.mentor.id === mentor!.id) && student.mentorId !== mentor.id) {
      setResponse(ctx, BAD_REQUEST, { message: 'incorrect mentor-student relation' });
      return;
    }
  }

  await getRepository(Student).update(student.id, {
    isExpelled: true,
    expellingReason: data.comment || '',
    endDate: new Date(),
  });
  setResponse(ctx, OK);
  return;
};

export const getStudentSummary = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;

  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, OK, null);
    return;
  }

  const [score, mentor] = await Promise.all([
    courseService.getStudentScore(student.id),
    student.mentorId ? await courseService.getMentorWithContacts(student.mentorId) : null,
  ]);

  setResponse(ctx, OK, {
    ...score,
    isActive: !student.isExpelled && !student.isFailed,
    mentor,
  });
};
