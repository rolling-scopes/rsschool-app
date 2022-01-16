import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const alias = ctx.query.course;
    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    const course = courses.find(c => c.alias === alias) || null;
    return { props: { course } };
  } catch (e) {
    return { props: { course: null } };
  }
};
