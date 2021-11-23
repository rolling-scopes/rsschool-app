import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';
import { parse } from 'cookie';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const cookies = parse(ctx.req.headers.cookie || '');
    const courses = await new UserService(cookies['auth-token']).getCourses();
    return {
      props: { courses },
    };
  } catch (e) {
    return {
      props: { courses: [] },
    };
  }
};
