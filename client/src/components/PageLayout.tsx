import { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Spin, Row, Col, Layout, Result, Button } from 'antd';
import { AdminSider } from './Sider/AdminSider';
import { Course } from 'services/models';

type Props = {
  loading: boolean;
  error?: Error;
  showCourseName?: boolean;
  title?: string;
  children?: any;
  noData?: boolean;
  background?: string;
  withMargin?: boolean;
};

export function PageLayout(props: Props) {
  if (process.env.NODE_ENV !== 'production' && props.error) console.error(props.error);
  const withMargin = props.withMargin ?? true;

  return (
    <Layout style={{ background: props.background ?? 'transparent', minHeight: '100vh' }}>
      <Header title={props.title} showCourseName={props.showCourseName} />
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
        <Layout.Content style={withMargin ? { margin: 16 } : undefined}>
          <Spin spinning={props.loading}>{props.children}</Spin>
        </Layout.Content>
      )}
    </Layout>
  );
}

export function PageLayoutSimple(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} showCourseName={props.showCourseName} />
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
  title,
  loading,
  children,
  showCourseName,
  courses,
  styles,
}: PropsWithChildren<{
  title?: string;
  showCourseName?: boolean;
  loading: boolean;
  courses: Course[];
  styles?: React.CSSProperties;
}>) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header title={title} showCourseName={showCourseName} />
      <Layout style={{ background: '#e5e5e5' }}>
        <AdminSider courses={courses} />
        <Layout.Content style={{ background: '#fff', margin: 16, padding: 16, ...styles }}>
          <Spin spinning={loading}>{children}</Spin>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
