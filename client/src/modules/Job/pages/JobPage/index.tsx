import { Table } from 'antd';
import { PageLayout } from 'components/PageLayout';
import { SessionContext } from 'modules/Course/contexts';
import { useContext, useState } from 'react';

export function JobPage() {
  const session = useContext(SessionContext);
  const [loading] = useState(false);

  return (
    <PageLayout githubId={session.githubId} loading={loading}>
      <Table
        size="middle"
        columns={[
          {
            title: 'Status',
          },
          {
            title: 'Company',
          },
          {
            title: 'Skills',
          },
          {
            title: 'Description',
          },
          {
            title: 'Published Date',
          },
        ]}
      />
    </PageLayout>
  );
}
