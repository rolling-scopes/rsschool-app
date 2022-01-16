import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    const courses = await new UserService(token).getCourses();
    return {
      props: { courses },
    };
  } catch (e) {
    return {
      props: { courses: [] },
    };
  }
};
