import { CoursesInterviewsApi, CoursesTasksApi, CourseStatsApi, StudentDto, StudentsApi } from 'api';
import { templates } from 'data/interviews';
import { getTasksTotalScore } from 'domain/course';
import { notAuthorizedResponse, noAccessResponse } from 'modules/Course/data';
import { GetServerSideProps } from 'next';
import type { CourseOnlyPageProps } from 'services/models';
import { UserService } from 'services/user';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';

export type PageProps = CourseOnlyPageProps & {
  interviewId: number;
  type: keyof typeof templates;
  student: StudentDto | null;
  courseSummary: {
    totalScore: number;
    studentsCount: number;
  };
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const type = ctx.params?.type as string;
    const studentId = ctx.query.studentId as string | undefined;

    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (course == null) {
      return notAuthorizedResponse;
    }
    const axiosConfig = getApiConfiguration(token);
    const [
      response,
      studentResponse,
      { data: tasks },
      {
        data: { studentsActiveCount },
      },
    ] = await Promise.all([
      new CoursesInterviewsApi(axiosConfig).getInterviews(course.id, false, ['interview', 'stage-interview']),
      studentId ? new StudentsApi(axiosConfig).getStudent(Number(studentId)) : Promise.resolve(null),
      new CoursesTasksApi(axiosConfig).getCourseTasks(course.id),
      new CourseStatsApi(axiosConfig).getCourseStats(course.id),
    ]);

    const interview =
      response.data.find(interview => {
        return (interview.attributes as { template?: string })?.template === type || interview.type === type;
      }) ?? null;

    if (interview == null) {
      return notAuthorizedResponse;
    }
    return {
      props: {
        course,
        interviewId: interview.id,
        type,
        student: studentResponse?.data ?? null,
        courseSummary: {
          totalScore: getTasksTotalScore(tasks),
          studentsCount: studentsActiveCount,
        },
      },
    };
  } catch (e) {
    return noAccessResponse;
  }
};
