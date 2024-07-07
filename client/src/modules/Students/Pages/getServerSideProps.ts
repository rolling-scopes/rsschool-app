import { CourseDto, CoursesApi } from 'api';
import { notAuthorizedResponse } from 'modules/Course/data';
import { GetServerSideProps } from 'next';
import { getApiConfiguration } from 'utils/axios';
import { getTokenFromContext } from 'utils/server';

export type PageProps = {
  courses: CourseDto[];
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    const { data: courses } = await new CoursesApi(getApiConfiguration(token)).getCourses();

    const props: PageProps = {
      courses,
    };

    return {
      props: props,
    };
  } catch (e) {
    return notAuthorizedResponse;
  }
};
