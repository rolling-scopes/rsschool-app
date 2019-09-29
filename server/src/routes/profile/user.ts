import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository } from 'typeorm';
import { ILogger } from '../../logger';
import { Course, CourseTask, Student, Task, User } from '../../models';
import { IUserSession } from '../../models/session';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import fs from 'fs';

export const getProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { isAdmin, githubId: userGithubId, roles } = ctx.state!.user as IUserSession;
  const query = ctx.query as { githubId: string | undefined };
  if (query === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  if (query.githubId === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const githubId = query.githubId.toLowerCase();
  if (!isAdmin) {
    const students = await getRepository(Student)
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.user', 'user')
      .innerJoinAndSelect('student.course', 'course')
      .innerJoinAndSelect('student.mentor', 'mentor')
      .innerJoinAndSelect('mentor.user', 'mentorUser')
      .where('user.githubId = :githubId AND course.completed=false ', { githubId })
      .getMany();

    const isMentor = students.some(
      student => student.mentor && student.mentor.user && (student.mentor.user as User).githubId === userGithubId,
    );
    const isCourseManager = students.some(student => roles[(student.course as Course)!.id] === 'coursemanager');
    if (!isMentor && !isCourseManager) {
      return;
    }
  }

  await getProfileByGithubId(ctx, githubId, githubId === userGithubId);
};

export const getProfileByGithubId = async (ctx: Router.RouterContext, githubId: string, excludeFeedback: boolean) => {
  const profile = await getRepository(User).findOne({
    where: { githubId },
    relations: [
      'receivedFeedback',
      'receivedFeedback.fromUser',
      'mentors',
      'mentors.user',
      'mentors.students',
      'mentors.students.user',
      'students',
      'mentors.course',
      'students.course',
      'students.course.stages',
      'students.course.stages.courseTasks',
      'students.course.stages.courseTasks.task',
      'students.mentor',
      'students.mentor.user',
      'students.taskResults',
      'students.feedback',
      'students.taskInterviewResults',
      'students.certificate',
    ],
  });

  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const { students, mentors, receivedFeedback, ...user } = profile;
  fs.writeFileSync('profile.json', JSON.stringify(profile, undefined, 2));

  const result = {
    user,
    students: [] as any[],
    mentors: [] as any[],
    receivedFeedback: [] as any[],
  };

  if (students) {
    result.receivedFeedback = receivedFeedback || [];
    result.students = students.map(st => {
      const course = st.course as Course;
      const courseTasks = course.stages
        .reduce((acc, stage) => acc.concat(stage.courseTasks || []), [] as CourseTask[])
        .map(t => ({
          id: t.id,
          name: (t.task as Task).name,
          descriptionUrl: (t.task as Task).descriptionUrl,
        }));
      return {
        id: st.id,
        course: {
          id: course.id,
          name: course.name,
        },
        totalScore: st.totalScore,
        certificatePublicId: st.certificate ? st.certificate.publicId : null,
        completed: !st.isExpelled && !st.isFailed,
        expellingReason: st.expellingReason,
        taskResults: (st.taskResults || []).map(t => ({
          score: t.score,
          githubPrUrl: t.githubPrUrl,
          comment: t.comment,
          courseTask: courseTasks.find(ct => ct.id === t.courseTaskId),
        })),
        interviews: excludeFeedback
          ? []
          : (st.taskInterviewResults || []).map(t => ({
              formAnswers: t.formAnswers,
              score: t.score,
              comment: t.comment,
              courseTask: courseTasks.find(ct => ct.id === t.courseTaskId),
            })),
        mentor: st.mentor ? courseService.convertToMentorBasic(st.mentor) : null,
      };
    });
  }

  if (mentors) {
    result.mentors = mentors.map(m => {
      const course = m.course as Course;
      return {
        id: m.id,
        course: {
          id: course.id,
          name: course.name,
        },
        students: (m.students || []).map(s => courseService.convertToStudentBasic(s)),
      };
    });
  }

  setResponse(ctx, OK, result);
};
