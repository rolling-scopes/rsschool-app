import { Header } from './Header';
import { Spin, Row, Col } from 'antd';

type Props = { loading: boolean; githubId: string; courseName?: string; title: string; children: any };

export function PageLayout(props: Props) {
  return (
    <>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Spin spinning={props.loading}>{props.children}</Spin>
    </>
  );
}

export function PageLayoutSimple(props: Props) {
  return (
    <>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Spin spinning={props.loading}>
        <Row gutter={24} style={{ margin: 16 }}>
          <Col xs={24} sm={18} md={12} lg={10}>
            {props.children}
          </Col>
        </Row>
      </Spin>
    </>
  );
}
