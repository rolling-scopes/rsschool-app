import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const alias = ctx.query.course as string;
    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    return {
      props: {
        course: courses.find(course => course.alias === alias) ?? null,
      },
    };
  } catch (e) {
    return {
      props: {
        student: null,
      },
    };
  }
};
