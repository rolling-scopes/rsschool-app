import { Tabs } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { Session } from 'components/withSession';
import { Messenger } from './Messenger';
import { AdminNotificationsPage } from './AdminNotificationsSettingsPage';

type Props = { session: Session };

export function AdminPage({ session }: Props) {
  return (
    <AdminPageLayout session={session}>
      <Tabs type="card">
        <Tabs.TabPane tab="Settings" key="1">
          <AdminNotificationsPage />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Messages" key="2">
          <Messenger />
        </Tabs.TabPane>
      </Tabs>
    </AdminPageLayout>
  );
}
