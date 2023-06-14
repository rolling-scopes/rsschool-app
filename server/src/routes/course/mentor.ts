import Router from '@koa/router';
import { BAD_REQUEST, NOT_FOUND, OK, StatusCodes } from 'http-status-codes';
import { getCustomRepository, getRepository } from 'typeorm';
import { PreferredStudentsLocation } from '../../../../common/enums/mentor';
import { ILogger } from '../../logger';
import { Mentor, MentorRegistry, Student } from '../../models';
import { StudentRepository } from '../../repositories/student.repository';
import { courseService } from '../../services';
import { getUserByGithubId } from '../../services/user.service';
import { userGuards } from '../guards';
import { setResponse } from '../utils';

type Params = { courseId: number; githubId: string; courseTaskId: number };

export const getMentorStudents = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseId, githubId } = ctx.params as Params;
  const repository = getCustomRepository(StudentRepository);
  const students = await repository.findByMentor(courseId, githubId);
  setResponse(ctx, OK, students);
};

export const deleteMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.expelMentor(courseId, githubId);
  setResponse(ctx, OK);
};

export const restoreExpelledMentor = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const courseId: number = ctx.params.courseId;
  const githubId: string = ctx.params.githubId;
  await courseService.restoreMentor(courseId, githubId);
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
  const courseId: number = +ctx.params.courseId;
  const githubId: string = ctx.params.githubId;

  const input: { maxStudentsLimit: number; preferedStudentsLocation: PreferredStudentsLocation; students: number[] } =
    ctx.request.body;
  const user = await getUserByGithubId(githubId);

  if (user == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }

  const { maxStudentsLimit, preferedStudentsLocation } = input;
  const data = {
    ...(maxStudentsLimit ? { maxStudentsLimit } : {}),
    ...(preferedStudentsLocation ? { studentsPreference: preferedStudentsLocation } : {}),
  };
  const mentorRepository = getRepository(Mentor);
  const exist = await mentorRepository.findOne({ where: { courseId, userId: user.id } });
  let mentorId = exist?.id;
  if (mentorId == null) {
    const mentorRegistrationInfo = await getRepository(MentorRegistry).findOne({ where: { userId: user.id } });

    const guard = userGuards(ctx.state.user);
    const isMentorApproved = (mentorRegistrationInfo?.preselectedCourses ?? []).some(
      approvedCourseId => courseId === +approvedCourseId,
    );

    if (!isMentorApproved && !(guard.isPowerUser(courseId) || guard.isSupervisor(courseId))) {
      setResponse(ctx, StatusCodes.FORBIDDEN);
      return;
    }
    const {
      identifiers: [identifier],
    } = await mentorRepository.insert({
      courseId,
      userId: user.id,
      ...data,
    });
    mentorId = identifier['id'];
  } else {
    await mentorRepository.update(mentorId, data);
  }

  const studentRepository = getRepository(Student);
  if (input.students.length > 0) {
    if (exist) {
      await studentRepository.update({ mentorId }, { mentorId: null });
    }
    await studentRepository.update(input.students, { mentorId });
  }

  setResponse(ctx, OK);
};
