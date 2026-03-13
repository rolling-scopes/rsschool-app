import { OpportunitiesApi } from 'api';
import { BASE_PATH } from 'api/base';
import { Configuration } from 'api/configuration';
import { AxiosRequestConfig } from 'axios';
import { GetServerSidePropsContext } from 'next';

const rsHost = process.env.RS_HOST || '';

function getNestJsServerAxiosProps(token?: string): Partial<AxiosRequestConfig> {
  return {
    baseURL: rsHost ? rsHost + BASE_PATH : undefined,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
}

function getApiConfiguration(token?: string): Configuration {
  const props = getNestJsServerAxiosProps(token);
  return new Configuration({ basePath: props.baseURL, baseOptions: props });
}

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
