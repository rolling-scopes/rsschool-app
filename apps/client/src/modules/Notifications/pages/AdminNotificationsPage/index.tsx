import { Tabs } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { Session } from 'components/withSession';
import { AdminNotificationsPage } from './AdminNotificationsSettingsPage';
import { Course } from 'services/models';

type Props = { session: Session; courses: Course[] };

export function AdminPage({ session, courses }: Props) {
  return (
    <AdminPageLayout session={session} title="Notifications" loading={false} courses={courses}>
      <Tabs type="card">
        <Tabs.TabPane tab="Settings" key="1">
          <AdminNotificationsPage />
        </Tabs.TabPane>
      </Tabs>
    </AdminPageLayout>
  );
}
