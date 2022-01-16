import { Header } from './Header';
import { Spin, Row, Col, Layout } from 'antd';

type Props = {
  loading: boolean;
  githubId: string;
  courseName?: string;
  title?: string;
  children?: any;
  noData?: boolean;
};

export function PageLayout(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
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
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content>
        {props.noData ? (
          <div>no data</div>
        ) : (
          <Spin spinning={props.loading}>
            <Row style={{ marginTop: 16 }}></Row>
            <Row gutter={24}>
              <Col flex={1} />
              <Col xs={20} sm={16} md={12} lg={8} xl={8}>
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
