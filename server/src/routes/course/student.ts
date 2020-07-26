import { BAD_REQUEST, OK } from 'http-status-codes';
import Router from '@koa/router';
import { getRepository, getCustomRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Feedback, TaskInterviewResult } from '../../models';
import { courseService, taskService, studentService } from '../../services';
import { setResponse } from '../utils';
import { StudentRepository } from '../../repositories/student';

type FeedbackInput = { toUserId: number; comment: string };

export const updateStudentStatus = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const data: { comment?: string; status: 'expelled' | 'active' } = ctx.request.body;
  const { allow, message = 'no access' } = await studentService.canChangeStatus(ctx.state.user, courseId, githubId);

  if (!allow) {
    setResponse(ctx, BAD_REQUEST, { message });
    return;
  }

  const studentRepository = getCustomRepository(StudentRepository);
  switch (data.status) {
    case 'active':
      await studentRepository.restore(courseId, githubId);
      setResponse(ctx, OK);
      break;
    case 'expelled':
      await studentRepository.expel(courseId, githubId, data.comment);
      setResponse(ctx, OK);
      break;
    default:
      setResponse(ctx, BAD_REQUEST, { message: 'not supported status' });
      break;
  }
};

export const selfUpdateStudentStatus = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params;
  const data: { comment?: string } = ctx.request.body;

  if (ctx.state.user.githubId === githubId) {
    const studentRepository = getCustomRepository(StudentRepository);
    await studentRepository.expel(courseId, githubId, data.comment);
    setResponse(ctx, OK);
  } else {
    setResponse(ctx, BAD_REQUEST, { message: 'access denied' });
  }
};

export const postFeedback = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const data: FeedbackInput = ctx.request.body;
  const id = ctx.state.user.id;

  const feedback: Partial<Feedback> = {
    comment: data.comment,
    course: courseId,
    fromUser: id,
    toUser: data.toUserId,
  };
  const result = await getRepository(Feedback).save(feedback);

  setResponse(ctx, OK, result);
  return;
};

export const getStudentSummary = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;

  const student = await courseService.getStudentByGithubId(courseId, githubId);
  if (student == null) {
    setResponse(ctx, OK, null);
    return;
  }

  const [score, mentor] = await Promise.all([
    courseService.getStudentScore(student.id),
    student.mentorId ? await courseService.getMentorWithContacts(student.mentorId) : null,
  ]);

  setResponse(
    ctx,
    OK,
    {
      ...score,
      isActive: !student.isExpelled && !student.isFailed,
      mentor,
      repository: student.repository,
    },
    60,
  );
};

export const updateStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const student = await courseService.queryStudentByGithubId(courseId, githubId);
  const data: { mentorGithuId: string | null } = ctx.request.body;
  if (student == null || data.mentorGithuId === undefined) {
    setResponse(ctx, BAD_REQUEST, null);
    return;
  }
  const studentRepository = getCustomRepository(StudentRepository);
  await studentRepository.setMentor(courseId, githubId, data.mentorGithuId);
  const updatedStudent = await studentRepository.findAndIncludeMentor(courseId, githubId);

  setResponse(ctx, OK, updatedStudent);
};

export const getStudent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params;
  const studentRepository = getCustomRepository(StudentRepository);
  const student = await studentRepository.findAndIncludeDetails(courseId, githubId);
  setResponse(ctx, OK, student);
};

export const createInterviewResult = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId, courseTaskId } = ctx.params as {
    githubId: string;
    courseId: number;
    courseTaskId: number;
  };
  const userId = ctx.state.user.id;

  const inputData: InterviewResultInput = ctx.request.body;

  if (inputData.score == null) {
    setResponse(ctx, BAD_REQUEST, 'no score');
    return;
  }

  const [student, mentor] = await Promise.all([
    courseService.queryStudentByGithubId(courseId, githubId),
    courseService.getCourseMentor(courseId, userId),
  ]);

  if (student == null || mentor == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid student or mentor' });
    return;
  }

  const courseTask = await taskService.getCourseTaskOnly(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST, { message: 'not valid course task' });
    return;
  }

  const repository = getRepository(TaskInterviewResult);
  const existingResult = await repository
    .createQueryBuilder('taskInterviewResult')
    .where('"taskInterviewResult"."studentId" = :studentId', { studentId: student.id })
    .andWhere('"taskInterviewResult"."courseTaskId" = :courseTaskId', { courseTaskId: courseTask.id })
    .andWhere('"taskInterviewResult"."mentorId" = :mentorId', { mentorId: mentor.id })
    .getOne();

  if (existingResult != null) {
    const result = await repository.update(existingResult.id, {
      formAnswers: inputData.formAnswers,
      score: Math.round(Number(inputData.score)),
      comment: inputData.comment || '',
    });
    setResponse(ctx, OK, result);
    return;
  }

  const entry: Partial<TaskInterviewResult> = {
    mentorId: mentor.id,
    studentId: student.id,
    formAnswers: inputData.formAnswers,
    score: Math.round(Number(inputData.score)),
    comment: inputData.comment || '',
    courseTaskId: courseTask.id,
  };
  const result = await repository.insert(entry);
  setResponse(ctx, OK, result);
};

export const getCrossMentors = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId, courseId } = ctx.params as {
    githubId: string;
    courseId: number;
  };

  const taskCheckers = await courseService.getCrossMentorsByStudent(courseId, githubId);

  setResponse(ctx, OK, taskCheckers);
};

type InterviewResultInput = {
  score: number | string;
  comment: string;
  formAnswers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
};
