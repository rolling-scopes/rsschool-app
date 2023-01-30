import { Row, Switch, Typography } from 'antd';
import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { ExportCsvButton } from 'modules/Score/components/ExportCsvButton';
import { ScoreTable } from 'modules/Score/components/ScoreTable';
import { getExportCsvUrl } from 'modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from 'modules/Score/data/isExportEnabled';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { CoursePageProps } from 'services/models';

const { Text } = Typography;

export function ScorePage(props: CoursePageProps) {
  if (!props.course) {
    return <CourseNoAccess />;
  }

  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const handleActiveOnlyChange = () => setActiveOnly(!activeOnly);

  const handleExportCsv = useCallback(
    () => (window.location.href = getExportCsvUrl(props.course.id, cityName, mentor)),
    [cityName, mentor, props.course.id],
  );

  const csvEnabled = isExportEnabled(props);

  return (
    <CoursePageLayout course={props.course} title="Score" githubId={props.session.githubId} loading={loading}>
      <Row style={{ margin: '8px 0' }} justify="space-between">
        <div>
          <span style={{ display: 'inline-block', lineHeight: '24px' }}>Active Students Only</span>{' '}
          <Switch checked={activeOnly} onChange={handleActiveOnlyChange} />
        </div>
        <Text mark>Total score and position is updated every day at 04:00 GMT+3</Text>
        <ExportCsvButton enabled={csvEnabled} onClick={handleExportCsv} />
      </Row>
      <ScoreTable {...props} activeOnly={activeOnly} onLoading={setLoading} />
    </CoursePageLayout>
  );
}
