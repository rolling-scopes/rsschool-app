import { Radio, RadioChangeEvent, Row, Switch, Typography } from 'antd';
import { CourseNoAccess } from 'modules/Course/components/CourseNoAccess';
import { CoursePageLayout } from 'components/CoursePageLayout';
import { ExportCsvButton } from 'modules/Score/components/ExportCsvButton';
import { ScoreTable } from 'modules/Score/components/ScoreTable';
import { getExportCsvUrl } from 'modules/Score/data/getExportCsvUrl';
import { isExportEnabled } from 'modules/Score/data/isExportEnabled';
import { useRouter } from 'next/router';
import { useCallback, useState, useContext } from 'react';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { LocalStorageKey, StudentPosition } from 'modules/Score/constants';
import { useLocalStorage } from 'react-use';

const { Text } = Typography;

export function ScorePage() {
  const { course } = useActiveCourseContext();
  const session = useContext(SessionContext);

  const router = useRouter();
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [studentPosition = StudentPosition.Top, setStudentPosition] = useLocalStorage<StudentPosition>(
    LocalStorageKey.StudentPosition,
  );

  const handleActiveOnlyChange = () => setActiveOnly(!activeOnly);

  const handleStudentPositionChange = ({ target }: RadioChangeEvent) => {
    setStudentPosition(target.value);
  };

  const handleExportCsv = useCallback(
    () => (window.location.href = getExportCsvUrl(course?.id, cityName, mentor)),
    [cityName, mentor, course?.id],
  );

  const csvEnabled = isExportEnabled({ course, session });

  return !course ? (
    <CourseNoAccess />
  ) : (
    <CoursePageLayout showCourseName course={course} title="Score" githubId={session.githubId} loading={loading}>
      <Row style={{ margin: '8px 0' }} justify="space-between">
        <div>
          <span style={{ display: 'inline-block', lineHeight: '24px' }}>Active Students Only</span>{' '}
          <Switch checked={activeOnly} onChange={handleActiveOnlyChange} /> <span>My Position</span>{' '}
          <Radio.Group defaultValue={studentPosition} onChange={handleStudentPositionChange}>
            <Radio.Button value="top">Top</Radio.Button>
            <Radio.Button value="bottom">Bottom</Radio.Button>
            <Radio.Button value="disabled">Disabled</Radio.Button>
          </Radio.Group>
        </div>
        <Text mark>Total score and position is updated every day at 04:00 GMT+3</Text>
        <ExportCsvButton enabled={csvEnabled} onClick={handleExportCsv} />
      </Row>
      <ScoreTable
        session={session}
        course={course}
        activeOnly={activeOnly}
        studentPosition={studentPosition}
        onLoading={setLoading}
      />
    </CoursePageLayout>
  );
}
