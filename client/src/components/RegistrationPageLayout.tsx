import { Spin, Layout } from 'antd';
import { Header } from './Header';

const { Content } = Layout;

type Props = { loading: boolean; githubId: string; courseName?: string; title?: string; children?: any };

export function RegistrationPageLayout(props: Props) {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F0F2F5' }}>
      <Header />
      <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Content>
    </Layout>
  );
}
