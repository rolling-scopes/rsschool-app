import { Spin, Layout } from 'antd';

const { Content } = Layout;

type Props = { loading: boolean; githubId: string; courseName?: string; title?: string; children?: any };

export function RegistrationPageLayout(props: Props) {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <Content style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Content>
    </Layout>
  );
}
