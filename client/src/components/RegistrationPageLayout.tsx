import { Layout, Spin } from 'antd';
import { mapsApiKey } from 'configs/gcp';
import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from '@client/shared/components/Header';

const { Content } = Layout;

type Props = { loading: boolean; title?: string; children?: ReactNode };

const url = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&language=en`;

export function RegistrationPageLayout(props: Props) {
  return (
    <>
      {mapsApiKey && (
        <Head>
          <script async src={url}></script>
        </Head>
      )}
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Spin spinning={props.loading}>{props.children}</Spin>
        </Content>
      </Layout>
    </>
  );
}
