import { Alert, Layout } from 'antd';
import { FooterLayout } from 'components/Footer';
import { PageLayout } from 'components/PageLayout';
import { Session } from 'components/withSession';
import Link from 'next/link';
import { useState } from 'react';

export function ConnectionConfirmed({ session }: { session: Session }) {
  const [connectionType] = useState(window ? new URLSearchParams(window.location.search).get('connectionType') : null);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <PageLayout loading={false} title="Connection confirmed" githubId={session.githubId} background="#fff">
        <Alert
          type="success"
          showIcon
          message={`Your have successfully connected your ${connectionType}`}
          description={
            <div>
              Now you can subscribe to <Link href="/profile/notifications">notifications</Link>
            </div>
          }
        />
      </PageLayout>
      <FooterLayout />
    </Layout>
  );
}
