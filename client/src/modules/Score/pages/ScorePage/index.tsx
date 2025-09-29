import { Space, Tabs } from 'antd';
import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { ExportCsvButton } from 'modules/Score/components/ExportCsvButton';
import { ScoreTable } from 'modules/Score/components/ScoreTable';
import { getExportCsvUrl } from 'modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from 'modules/Score/data/isExportEnabled';
import { useRouter } from 'next/router';
import { useCallback, useState, useContext } from 'react';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { UpdateAlert } from '@client/modules/Score/pages/ScorePage/UpdateAlert';

export function ScorePage() {
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const [loading, setLoading] = useState(false);

  const tabs: { key: string; label: string; children: React.ReactNode }[] = [
    {
      key: 'all',
      label: 'All',
      children: <ScoreTable session={session} course={course} activeOnly={false} onLoading={setLoading} />,
    },
    {
      key: 'active',
      label: 'Active',
      children: <ScoreTable session={session} course={course} activeOnly={true} onLoading={setLoading} />,
    },
  ];

  const handleExportCsv = useCallback(
    () => (window.location.href = getExportCsvUrl(course?.id, cityName, mentor)),
    [cityName, mentor, course?.id],
  );

  const csvEnabled = isExportEnabled({ course, session });

  return !course ? (
    <CourseNoAccess />
  ) : (
    <CoursePageLayout showCourseName course={course} title="Score" githubId={session.githubId} loading={loading}>
      <Tabs
        tabBarStyle={{ marginBottom: 0 }}
        items={tabs}
        defaultActiveKey="active"
        tabBarExtraContent={
          <Space style={{ display: 'flex', alignItems: 'center' }}>
            <UpdateAlert />
            <ExportCsvButton enabled={csvEnabled} onClick={handleExportCsv} />
          </Space>
        }
      />
    </CoursePageLayout>
  );
}
