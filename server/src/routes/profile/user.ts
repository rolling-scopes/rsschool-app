import { NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import Router from 'koa-router';
import { getRepository, In } from 'typeorm';
import { ILogger } from '../../logger';
import { CourseTask, Student, Mentor, Task, User, StageInterview } from '../../models';
import { IUserSession } from '../../models/session';
import { courseService } from '../../services';
import { setResponse } from '../utils';
import { getStudentInterviewRatings } from '../../services/stageInterviews';

export const getProfile = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { isAdmin, githubId: userGithubId, roles, coursesRoles } = ctx.state!.user as IUserSession;
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
  if (isAdmin) {
    await getProfileByGithubId(ctx, githubId, false);
    return;
  }
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.course', 'course')
    .leftJoinAndSelect('student.mentor', 'mentor')
    .leftJoinAndSelect('mentor.user', 'mentorUser')
    .leftJoin('student.taskChecker', 'taskChecker')
    .leftJoin('taskChecker.mentor', 'checkerMentor')
    .leftJoin('checkerMentor.user', 'checkerUser')
    .addSelect(['taskChecker.id', 'checkerMentor.id', 'checkerMentor.userId', 'checkerUser.id', 'checkerUser.githubId'])
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
  const isCourseMentor = students.some(student => {
    return !student.course.completed && roles[student.course.id] === 'mentor' && stageInterviews.length === 0;
  });
  const isCourseManager = students.some(
    student => roles[student.course.id] === 'coursemanager' || coursesRoles?.[student.course.id]?.includes('manager'),
  );
  const isStageInterviewer = stageInterviews.some(
    interview => interview.mentor && interview.mentor.user && interview.mentor.user.githubId === userGithubId,
  );
  const isTaskChecker = students.some(student =>
    student.taskChecker?.some(t => t.mentor?.user?.githubId === userGithubId),
  );

  if (!isTaskChecker && !isMentor && !isCourseManager && !isStageInterviewer && !isCourseMentor) {
    setResponse(ctx, UNAUTHORIZED);
    return;
  }
  await getProfileByGithubId(ctx, githubId, githubId === userGithubId || isTaskChecker);
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
            'stageInterviews',
            'stageInterviews.stageInterviewFeedbacks',
            'stageInterviews.stage',
            'stageInterviews.mentor',
            'stageInterviews.mentor.user',
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
    const { course, id, stageInterviews } = st;
    const courseTasks = course.stages
      .reduce((acc, stage) => acc.concat(stage.courseTasks || []), [] as CourseTask[])
      .map(t => ({
        id: t.id,
        name: (t.task as Task).name,
        descriptionUrl: (t.task as Task).descriptionUrl,
      }));
    const stageInterviewsResult = stageInterviews
      ? stageInterviews
          .filter(stageInterview => stageInterview.isCompleted && stageInterview.stage.courseId === course.id)
          .map(stageInterview => {
            const [feedback] = stageInterview.stageInterviewFeedbacks;
            const stageInterviewFeedbackJson = JSON.parse(feedback.json);
            const { english, programmingTask, resume } = stageInterviewFeedbackJson;
            const { rating, htmlCss, common, dataStructures } = getStudentInterviewRatings(stageInterviewFeedbackJson);

            return {
              programmingTask,
              date: feedback.updatedDate,
              decision: stageInterview.decision,
              isGoodCandidate: stageInterview.isGoodCandidate,
              english: english.levelMentorOpinion ? english.levelMentorOpinion : english.levelStudentOpinion,
              comment: resume.comment,
              rating,
              interviewer: {
                githubId: stageInterview.mentor.user.githubId,
                name: `${stageInterview.mentor.user.firstName} ${stageInterview.mentor.user.lastName}`,
              },
              skills: {
                htmlCss,
                common,
                dataStructures,
              },
            };
          })
      : [];

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
      stageInterviews: stageInterviewsResult,
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
