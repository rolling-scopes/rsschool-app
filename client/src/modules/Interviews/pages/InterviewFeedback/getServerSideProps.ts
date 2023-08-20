import {
  CoursesTasksApi,
  CourseStatsApi,
  StudentDto,
  StudentsApi,
  CoursesInterviewsApi,
  InterviewFeedbackDto,
} from 'api';
import { templates } from 'data/interviews';
import { getTasksTotalScore } from 'domain/course';
import { stageInterviewType } from 'domain/interview';
import { notAuthorizedResponse } from 'modules/Course/data';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import type { CourseOnlyPageProps } from 'services/models';
import { UserService } from 'services/user';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';

export type StageFeedbackProps = CourseOnlyPageProps & {
  interviewId: number;
  student: StudentDto;
  courseSummary: {
    totalScore: number;
    studentsCount: number;
  };
  interviewFeedback: InterviewFeedbackDto;
  type: typeof stageInterviewType;
};

export type FeedbackProps = CourseOnlyPageProps & {
  interviewTaskId: number;
  type: keyof typeof templates;
  githubId: string;
};

export type PageProps = FeedbackProps | StageFeedbackProps;

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const type = ctx.params?.type as PageProps['type'];

    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (!course || !type) {
      return notAuthorizedResponse;
    }

    const pageProps = await (type === stageInterviewType
      ? getStageInterviewData({ ctx, courseId: course.id, token })
      : getInterviewData({ ctx, courseId: course.id, token }));

    const props: PageProps = {
      ...pageProps,
      course,
    };

    return {
      props: props,
    };
  } catch (e) {
    return notAuthorizedResponse;
  }
};

/**
 * Gets stage interview data
 */
async function getStageInterviewData({
  ctx,
  token,
  courseId,
}: {
  ctx: GetServerSidePropsContext<ParsedUrlQuery>;
  token: string | undefined;
  courseId: number;
}): Promise<Omit<StageFeedbackProps, keyof CourseOnlyPageProps>> {
  const studentId = ctx.query.studentId as string | undefined;

  if (!studentId || !ctx.query.interviewId) {
    throw new Error('No studentId or interviewId');
  }
  const interviewId = Number(ctx.query.interviewId);
  const axiosConfig = getApiConfiguration(token);

  const [
    { data: student },
    { data: tasks },
    {
      data: { studentsActiveCount },
    },
    { data: interviewFeedback },
  ] = await Promise.all([
    new StudentsApi(axiosConfig).getStudent(Number(studentId)),
    new CoursesTasksApi(axiosConfig).getCourseTasks(courseId),
    new CourseStatsApi(axiosConfig).getCourseStats(courseId),
    new CoursesInterviewsApi(axiosConfig).getInterviewFeedback(courseId, interviewId, stageInterviewType),
  ]);
  if (!student) {
    throw new Error('Student not found');
  }

  return {
    interviewId,
    student,
    courseSummary: {
      totalScore: getTasksTotalScore(tasks),
      studentsCount: studentsActiveCount,
    },
    interviewFeedback,
    type: stageInterviewType,
  };
}

/**
 * Gets regular interview data
 */
async function getInterviewData({
  ctx,
  token,
  courseId,
}: {
  ctx: GetServerSidePropsContext<ParsedUrlQuery>;
  token: string | undefined;
  courseId: number;
}): Promise<Omit<FeedbackProps, keyof CourseOnlyPageProps>> {
  const githubId = ctx.query.githubId as string;
  const type = ctx.params?.type as FeedbackProps['type'];
  const response = await new CoursesInterviewsApi(getApiConfiguration(token)).getInterviews(courseId, false);
  const interview =
    response.data.find(interview => (interview.attributes as { template?: string })?.template === type) ?? null;

  if (interview == null) {
    throw new Error('Interview not found');
  }

  return {
    interviewTaskId: interview.id,
    type,
    githubId,
  };
}
