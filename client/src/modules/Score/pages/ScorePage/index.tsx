import { Row, Space, Switch, Typography } from 'antd';
import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { ExportCsvButton } from 'modules/Score/components/ExportCsvButton';
import { ScoreTable } from 'modules/Score/components/ScoreTable';
import { getExportCsvUrl } from 'modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from 'modules/Score/data/isExportEnabled';
import { useRouter } from 'next/router';
import { useCallback, useState, useContext } from 'react';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';

const { Text } = Typography;

export function ScorePage() {
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const handleActiveOnlyChange = () => setActiveOnly(!activeOnly);

  const handleExportCsv = useCallback(
    () => (window.location.href = getExportCsvUrl(course?.id, cityName, mentor)),
    [cityName, mentor, course?.id],
  );

  const csvEnabled = isExportEnabled({ course, session });

  return !course ? (
    <CourseNoAccess />
  ) : (
    <CoursePageLayout showCourseName course={course} title="Score" githubId={session.githubId} loading={loading}>
      <Row style={{ margin: '8px 0', gap: 8 }} justify="space-between">
        <Space>
          <Text>Active Students Only</Text>
          <Switch checked={activeOnly} onChange={handleActiveOnlyChange} />
        </Space>
        <Text mark>Total score and position is updated every day at 04:00 GMT+3</Text>
        <ExportCsvButton enabled={csvEnabled} onClick={handleExportCsv} />
      </Row>
      <ScoreTable session={session} course={course} activeOnly={activeOnly} onLoading={setLoading} />
    </CoursePageLayout>
  );
}
