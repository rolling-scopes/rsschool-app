import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const courses = await new UserService(ctx).getCourses();
    return {
      props: { courses },
    };
  } catch (e) {
    return {
      props: { courses: [] },
    };
  }
};
