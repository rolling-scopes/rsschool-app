import { Layout, Row, Typography } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useContext, useState } from 'react';

export function JobMainPage() {
  const session = useContext(SessionContext);
  const [loading] = useState(false);

  return (
    <PageLayout githubId={session.githubId} loading={loading}>
      <Layout style={{ background: 'transparent' }}>
        <Layout.Content>
          <Row justify="center">
            <Typography.Title level={4} style={{ maxWidth: '448px' }}>
              RS Jobs - developer job portal powered by The Rolling Scopes developer community
            </Typography.Title>
          </Row>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}
