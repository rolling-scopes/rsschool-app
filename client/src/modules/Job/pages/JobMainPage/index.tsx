import { Layout, Row, Typography } from 'antd';

export function JobMainPage() {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Layout.Content>
        <Row justify="center">
          <Typography.Title level={4} style={{ maxWidth: '448px' }}>
            RS Jobs - developer job portal powered by The Rolling Scopes developer community
          </Typography.Title>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
