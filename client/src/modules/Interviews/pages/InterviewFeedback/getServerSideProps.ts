import { CoursesInterviewsApi } from 'api';
import { templates } from 'data/interviews';
import { notAuthorizedResponse, noAccessResponse } from 'modules/Course/data';
import { GetServerSideProps } from 'next';
import type { CourseOnlyPageProps } from 'services/models';
import { UserService } from 'services/user';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';

export type PageProps = CourseOnlyPageProps & {
  interviewId: number;
  type: keyof typeof templates;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const type = ctx.params?.type as string;

    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;

    if (course == null) {
      return notAuthorizedResponse;
    }

    const response = await new CoursesInterviewsApi(getApiConfiguration(token)).getInterviews(course.id);
    const interview =
      response.data.find(interview => (interview.attributes as { template?: string })?.template === type) ?? null;

    if (interview == null) {
      return notAuthorizedResponse;
    }
    return {
      props: { course, interviewId: interview.id, type },
    };
  } catch (e) {
    return noAccessResponse;
  }
};
