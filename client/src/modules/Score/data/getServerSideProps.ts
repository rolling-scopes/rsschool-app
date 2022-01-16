import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const alias = ctx.query.course;
    const courses = await new UserService(ctx).getCourses();
    const course = courses.find(c => c.alias === alias) || null;
    return { props: { course } };
  } catch (e) {
    return { props: { course: null } };
  }
};
