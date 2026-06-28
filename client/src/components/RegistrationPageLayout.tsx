import { Layout, Spin } from 'antd';
import { mapsApiKey } from '@client/configs/gcp';
import Script from 'next/script';
import { ReactNode } from 'react';
import { Header } from '@client/shared/components/Header';

const { Content } = Layout;

type Props = { loading: boolean; title?: string; children?: ReactNode };

const url = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&language=en`;

export function RegistrationPageLayout(props: Props) {
  return (
    <>
      {mapsApiKey ? <Script src={url} /> : null}
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Spin spinning={props.loading}>{props.children}</Spin>
        </Content>
      </Layout>
    </>
  );
}
