import type { AxiosError } from 'axios';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { UserService } from 'services/user';
import { getTokenFromContext } from 'utils/server';

const noAccessResponse: GetServerSidePropsResult<any> = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
};

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    // eslint-disable-next-line no-console
    console.info(ctx.req.url, ctx.req.headers);
    const token = getTokenFromContext(ctx);
    if (token == null) {
      return noAccessResponse;
    }
    const courses = await new UserService(token).getCourses();
    return {
      props: { courses },
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error(error.message, error.response?.data);
    return noAccessResponse;
  }
};
