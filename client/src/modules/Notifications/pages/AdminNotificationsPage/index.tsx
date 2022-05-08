import { Tabs } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { Session } from 'components/withSession';
import { Messenger } from './Messenger';
import { AdminNotificationsPage } from './AdminNotificationsSettingsPage';
import { featureToggles } from 'services/features';
import { Course } from 'services/models';

type Props = { session: Session; courses: Course[] };

export function AdminPage({ session, courses }: Props) {
  return (
    <AdminPageLayout session={session} title="Notifications" loading={false} courses={courses}>
      <Tabs type="card">
        <Tabs.TabPane tab="Settings" key="1">
          <AdminNotificationsPage />
        </Tabs.TabPane>
        {featureToggles.adminMessenger && (
          <Tabs.TabPane tab="Messeges" key="2">
            <Messenger />
          </Tabs.TabPane>
        )}
      </Tabs>
    </AdminPageLayout>
  );
}
