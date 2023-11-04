import type { AxiosError } from 'axios';
import { JobMainPage } from 'modules/Job/pages/JobMainPage';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getTokenFromContext } from 'utils/server';

const noAccessResponse: GetServerSidePropsResult<any> = {
  redirect: {
    destination: '/job/welcome',
    permanent: false,
  },
};

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  try {
    const token = getTokenFromContext(ctx);
    if (token == null) {
      return noAccessResponse;
    }
    return {
      props: {},
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error(error.message, error.response?.data);
    return noAccessResponse;
  }
};

export default JobMainPage;
