import {
  CoursesTasksApi,
  CourseStatsApi,
  StudentDto,
  StudentsApi,
  CoursesInterviewsApi,
  InterviewFeedbackDto,
} from 'api';
import { AxiosError } from 'axios';
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
  interviewFeedback: InterviewFeedbackDto | null;
  type: typeof stageInterviewType;
  interviewMaxScore: number;
};

export type FeedbackProps = CourseOnlyPageProps & {
  githubId: string;
  interviewTaskId: number;
  type: keyof typeof templates;
};

export type PageProps = FeedbackProps | StageFeedbackProps;

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const type = ctx.params?.type as PageProps['type'];
    const interviewTaskId = ctx.query.interviewTaskId as string | undefined;

    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (!course || !interviewTaskId || !type) {
      return notAuthorizedResponse;
    }

    const pageProps =
      type === stageInterviewType
        ? await getStageInterviewData({ ctx, courseId: course.id, token })
        : getInterviewData(ctx);

    const props: PageProps = {
      ...pageProps,
      course,
    };

    return {
      props: props,
    };
  } catch (e) {
    console.error(e);
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
  const interviewTaskId = Number(ctx.query.interviewTaskId);

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
    new CoursesInterviewsApi(axiosConfig)
      .getInterviewFeedback(courseId, interviewId, stageInterviewType)
      .catch(error => {
        if ((error as AxiosError).response?.status === 404) {
          return { data: null };
        }
        throw error;
      }),
  ]);
  if (!student) {
    throw new Error('Student not found');
  }
  const task = tasks.find(task => task.id === interviewTaskId);
  if (!task) {
    throw new Error('Task not found');
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
    interviewMaxScore: task.maxScore,
  };
}

/**
 * Gets regular interview data
 */
function getInterviewData(
  ctx: GetServerSidePropsContext<ParsedUrlQuery>,
): Omit<FeedbackProps, keyof CourseOnlyPageProps> {
  const githubId = ctx.query.githubId as string;
  const type = ctx.params?.type as FeedbackProps['type'];
  const interviewTaskId = Number(ctx.query.interviewTaskId);

  return {
    interviewTaskId,
    type,
    githubId,
  };
}
