import { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Spin, Row, Col, Layout, Result, Button } from 'antd';
import { Session } from './withSession';
import { AdminSider } from './Sider/AdminSider';
import { Course } from 'services/models';

type Props = {
  loading: boolean;
  error?: Error;
  githubId: string;
  courseName?: string;
  title?: string;
  children?: any;
  noData?: boolean;
  background?: string;
};

export function PageLayout(props: Props) {
  if (process.env.NODE_ENV !== 'production' && props.error) console.error(props.error);

  return (
    <Layout style={{ background: props.background ?? 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      {props.error ? (
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={
            <Button type="primary" href="/">
              Back Home
            </Button>
          }
        />
      ) : (
        <Layout.Content style={{ margin: 16 }}>
          <Spin spinning={props.loading}>{props.children}</Spin>
        </Layout.Content>
      )}
    </Layout>
  );
}

export function PageLayoutSimple(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content>
        {props.noData ? (
          <div>no data</div>
        ) : (
          <Spin spinning={props.loading}>
            <Row style={{ marginTop: 16 }}></Row>
            <Row>
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

export function AdminPageLayout({
  session,
  title,
  courseName,
  loading,
  children,
  courses,
}: PropsWithChildren<{ session: Session; title?: string; courseName?: string; loading: boolean; courses: Course[] }>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header title={title} username={session.githubId} courseName={courseName} />
      <Layout style={{ background: '#e5e5e5' }}>
        <AdminSider session={session} courses={courses} />
        <Layout.Content style={{ background: '#fff', margin: 16, padding: 16 }}>
          <Spin spinning={loading}>{children}</Spin>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
