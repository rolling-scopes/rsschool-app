import { Row, Switch, Typography } from 'antd';
import { CourseNoAccess } from 'components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { ExportCsvButton } from 'modules/Score/components/ExportCsvButton';
import { ScoreTable } from 'modules/Score/components/ScoreTable';
import { getExportCsvUrl } from 'modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from 'modules/Score/data/isExportEnabled';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { CourseService, StudentScore } from 'services/course';
import { CoursePageProps } from 'services/models';
import { IPaginationInfo } from 'common/types/pagination';
import { ScoreTableFilters } from 'common/types/score';

const { Text } = Typography;

export function ScorePage(props: CoursePageProps) {
  if (!props.course) {
    return <CourseNoAccess />;
  }

  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const courseService = useMemo(() => new CourseService(props.course.id), []);

  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [students, setStudents] = useState({
    content: [] as StudentScore[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    filter: { activeOnly: true } as ScoreTableFilters,
    orderBy: { field: 'rank', direction: 'asc' },
  });

  const handleActiveOnlyChange = useCallback(async () => {
    const value = !activeOnly;
    setActiveOnly(value);
    setLoading(true);
    try {
      const courseScore = await courseService.getCourseScore(
        students.pagination,
        { ...students.filter, activeOnly: value },
        students.orderBy,
      );
      setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

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
