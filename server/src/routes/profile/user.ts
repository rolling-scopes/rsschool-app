import { NOT_FOUND, OK } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository, In } from 'typeorm';
import { ILogger } from '../../logger';
import { Course, CourseTask, Student, Mentor, Task, User, StageInterview } from '../../models';
import { IUserSession } from '../../models/session';
import { courseService } from '../../services';
import { setResponse } from '../utils';

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
      .leftJoinAndSelect('student.mentor', 'mentor')
      .leftJoinAndSelect('mentor.user', 'mentorUser')
      .where('user.githubId = :githubId AND course.completed = false ', { githubId })
      .getMany();

    const stageInterviews =
      students.length > 0
        ? await getRepository(StageInterview)
            .createQueryBuilder('stageInterview')
            .innerJoin('stageInterview.mentor', 'mentor')
            .innerJoin('mentor.user', 'mentorUser')
            .addSelect(['mentor.id', 'mentorUser.githubId'])
            .where(`stageInterview.studentId IN (${students.map(s => s.id).join(',')})`)
            .getMany()
        : [];

    const isMentor = students.some(
      student => student.mentor && student.mentor.user && (student.mentor.user as User).githubId === userGithubId,
    );
    const isCourseManager = students.some(student => roles[(student.course as Course)!.id] === 'coursemanager');
    const isInterviewer = stageInterviews.some(
      interview => interview.mentor && interview.mentor.user && interview.mentor.user.githubId === userGithubId,
    );
    if (!isMentor && !isCourseManager && !isInterviewer) {
      return;
    }
  }

  await getProfileByGithubId(ctx, githubId, githubId === userGithubId);
};

export const getProfileByGithubId = async (ctx: Router.RouterContext, githubId: string, excludeFeedback: boolean) => {
  const profile = await getRepository(User).findOne({
    where: { githubId },
    relations: ['receivedFeedback', 'receivedFeedback.fromUser', 'mentors', 'students'],
  });

  if (profile === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const { students: studentRecords, mentors: mentorRecords, receivedFeedback, ...user } = profile;

  const [students, mentors] = await Promise.all([
    studentRecords && studentRecords.length > 0
      ? getRepository(Student).find({
          where: { id: In(studentRecords.map(s => s.id)) },
          relations: [
            'course',
            'course.stages',
            'course.stages.courseTasks',
            'course.stages.courseTasks.task',
            'mentor',
            'mentor.user',
            'taskResults',
            'taskInterviewResults',
            'certificate',
          ],
        })
      : Promise.resolve([]),
    mentorRecords && mentorRecords.length > 0
      ? getRepository(Mentor).find({
          where: { id: In(mentorRecords.map(s => s.id)) },
          relations: ['user', 'course', 'students', 'students.user'],
        })
      : Promise.resolve([]),
  ]);

  const result = {
    user,
    students: [] as any[],
    mentors: [] as any[],
    receivedFeedback: [] as any[],
  };

  result.receivedFeedback = receivedFeedback || [];
  result.students = students.map(st => {
    const { course, id } = st;
    const courseTasks = course.stages
      .reduce((acc, stage) => acc.concat(stage.courseTasks || []), [] as CourseTask[])
      .map(t => ({
        id: t.id,
        name: (t.task as Task).name,
        descriptionUrl: (t.task as Task).descriptionUrl,
      }));

    return {
      id,
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
  result.mentors = mentors.map(({ id, course, students }) => ({
    id,
    course: { id: course.id, name: course.name },
    students: (students || []).map(courseService.convertToStudentBasic),
  }));

  setResponse(ctx, OK, result);
};
