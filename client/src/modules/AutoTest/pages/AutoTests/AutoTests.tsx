import { Col, Row } from 'antd';
import { ColProps } from 'antd/lib/grid';
import { PageLayout } from 'components/PageLayout';
import { StatusTabs, TaskCard } from 'modules/AutoTest/components';
import { useCourseTaskVerifications } from 'modules/AutoTest/hooks';
import { CourseTaskStatus } from 'modules/AutoTest/types';
import { useActiveCourseContext } from 'modules/Course/contexts';
import { useMemo, useState } from 'react';

const RESPONSIVE_COLUMNS: ColProps = {
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
};

function AutoTests() {
  const { course } = useActiveCourseContext();
  const { tasks } = useCourseTaskVerifications(course.id);
  const [activeTab, setActiveTab] = useState(CourseTaskStatus.Available);
  const statuses = useMemo(() => tasks?.map(t => t.status) || [], [tasks]);
  const filteredTasks = useMemo(() => tasks?.filter(t => t.status === activeTab) || [], [tasks, activeTab]);
  const isAvailableTab = activeTab === CourseTaskStatus.Available ? false : true;

  return (
    <PageLayout loading={false} title="Auto-tests" withMargin={false} showCourseName>
      <Row gutter={24} style={{ marginRight: 0, marginBottom: 24, padding: '0 16px' }}>
        <Col span={24}>
          <StatusTabs statuses={statuses} activeTab={activeTab} onTabChange={setActiveTab} />
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ padding: '0 16px', marginRight: 0 }}>
        {filteredTasks.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <TaskCard courseTask={courseTask} course={course} isAvailableTab={isAvailableTab} />
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}

export default AutoTests;
