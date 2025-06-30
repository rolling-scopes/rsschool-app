import { Spin, Layout } from 'antd';
import { Header } from './Header';
import { ReactNode } from 'react';

const { Content } = Layout;

type Props = { loading: boolean; title?: string; children?: ReactNode };

export function RegistrationPageLayout(props: Props) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Content>
    </Layout>
  );
}
