import { Header } from './Header';
import { Spin, Row, Col, Layout } from 'antd';

type Props = { loading: boolean; githubId: string; courseName?: string; title?: string; children?: any };

export function PageLayout(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={props.loading}>{props.children}</Spin>
      </Layout.Content>
    </Layout>
  );
}

export function PageLayoutSimple(props: Props) {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={props.loading}>
          <Row gutter={24} style={{ margin: 16 }}>
            <Col xs={24} sm={18} md={12} lg={10}>
              {props.children}
            </Col>
          </Row>
        </Spin>
      </Layout.Content>
    </Layout>
  );
}
