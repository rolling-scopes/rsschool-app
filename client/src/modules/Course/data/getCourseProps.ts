import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';
import type { ProfileCourseDto } from 'api';

export const noAccessResponse: GetServerSidePropsResult<any> = {
  redirect: {
    destination: '/course/403',
    permanent: false,
  },
};

export type PageProps = { course: ProfileCourseDto };

export const getCourseProps: GetServerSideProps<{ course: ProfileCourseDto }> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;
    if (course == null) {
      return noAccessResponse;
    }
    return {
      props: { course },
    };
  } catch (e) {
    return noAccessResponse;
  }
};
