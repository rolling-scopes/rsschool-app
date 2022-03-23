import { Header } from './Header';
import { Spin, Row, Col, Layout } from 'antd';
import { PropsWithChildren } from 'react';
import { Session } from './withSession';
import { AdminSider } from './AdminSider';

type Props = {
  loading: boolean;
  githubId: string;
  courseName?: string;
  title?: string;
  children?: any;
  noData?: boolean;
  background?: string;
};

export function PageLayout(props: Props) {
  return (
    <Layout style={{ background: props.background ?? 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content style={{ margin: 16 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}

export function PageLayoutSimple(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header isProfilePage title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content>
        {props.noData ? (
          <div>no data</div>
        ) : (
          <Spin spinning={props.loading}>
            <Row style={{ marginTop: 16 }}></Row>
            <Row gutter={24}>
              <Col flex={1} />
              <Col xs={20} sm={16} md={16} lg={12} xl={12}>
                {props.children}
              </Col>
              <Col flex={1} />
            </Row>
          </Spin>
        )}
      </Layout.Content>
    </Layout>
  );
}

export function AdminPageLayout({ session, children }: PropsWithChildren<{ session: Session }>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Notifications" username={session.githubId} />
        <Layout.Content style={{ margin: 8 }}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
