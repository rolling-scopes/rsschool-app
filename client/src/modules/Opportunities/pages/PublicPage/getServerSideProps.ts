import { GetServerSidePropsContext } from 'next';
import { OpportunitiesApi } from 'api';
import { getApiConfiguration } from 'utils/axios';

const opportunitiesApi = new OpportunitiesApi(getApiConfiguration());

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const uuid = ctx.params?.uuid as string;
  try {
    const { data } = await opportunitiesApi.getPublicResume(uuid);
    return {
      props: { data },
    };
  } catch (err) {
    console.error(err);

    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
