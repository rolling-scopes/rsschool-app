import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';
import type { CourseDto, ProfileCourseDto } from 'api';
import { CoursesService } from 'services/courses';

export const noAccessResponse: GetServerSidePropsResult<any> = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
};

export const notAuthorizedResponse: GetServerSidePropsResult<any> = {
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
    if (token == null) {
      return noAccessResponse;
    }
    const courses = await new UserService(token).getCourses();
    const course = courses.find(course => course.alias === alias) ?? null;
    if (course == null) {
      return notAuthorizedResponse;
    }
    return {
      props: { course },
    };
  } catch (e) {
    return noAccessResponse;
  }
};

export const getCoursesProps: GetServerSideProps<{ courses: CourseDto[] }> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    if (token == null) {
      return noAccessResponse;
    }
    const courses = await new CoursesService(token).getCourses();
    if (courses === null) {
      return notAuthorizedResponse;
    }
    return {
      props: { courses },
    };
  } catch (e) {
    return noAccessResponse;
  }
};
