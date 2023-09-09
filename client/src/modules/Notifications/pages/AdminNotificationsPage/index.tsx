import { Tabs } from 'antd';
import { AdminPageLayout } from 'components/PageLayout';
import { AdminNotificationsPage } from './AdminNotificationsSettingsPage';
import { useActiveCourseContext } from 'modules/Course/contexts';

export function AdminPage() {
  const { courses } = useActiveCourseContext();

  return (
    <AdminPageLayout title="Notifications" loading={false} courses={courses}>
      <Tabs type="card">
        <Tabs.TabPane tab="Settings" key="1">
          <AdminNotificationsPage />
        </Tabs.TabPane>
      </Tabs>
    </AdminPageLayout>
  );
}
