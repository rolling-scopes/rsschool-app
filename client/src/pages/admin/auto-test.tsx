import { Col, ColProps, Descriptions, Modal, Row, Switch, Tag, Typography, Divider, List, Checkbox } from 'antd';
import { AutoTestTaskDto, AutoTestsApi } from 'api';
import { AdminPageLayout } from 'components/PageLayout';
import AutoTestTaskCard from 'modules/AutoTest/components/AutoTestTaskCard/AutoTestTaskCard';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';
import { useEffect, useState } from 'react';
import { CourseRole } from 'services/models';

const RESPONSIVE_COLUMNS: ColProps = {
  sm: 24,
  md: 12,
  lg: 8,
  xl: 8,
  xxl: 6,
};

function Page() {
  const { courses } = useActiveCourseContext();
  const [tests, setTests] = useState<AutoTestTaskDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AutoTestTaskDto>();

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSelectTask = (task: AutoTestTaskDto) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const api = new AutoTestsApi();
    api.getAllRSSchoolAppTests().then(tests => setTests(tests.data));
  }, []);
  return (
    <AdminPageLayout title="Manage Discord Servers" loading={false} courses={courses}>
      <Row gutter={[24, 24]} style={{ padding: '0 16px', marginRight: 0 }}>
        {tests.map(courseTask => (
          <Col {...RESPONSIVE_COLUMNS} key={courseTask.id}>
            <AutoTestTaskCard courseTask={courseTask} handleSelectTask={handleSelectTask} />
          </Col>
        ))}
      </Row>
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={'80vw'} title={selectedTask?.name}>
        <Descriptions column={1}>
          <Descriptions.Item label="ID">{selectedTask?.id}</Descriptions.Item>
          <Descriptions.Item label="Type">{selectedTask?.type}</Descriptions.Item>
          <Descriptions.Item label="Description URL">
            <a href={selectedTask?.descriptionUrl}>{selectedTask?.descriptionUrl}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Discipline">{selectedTask?.discipline?.name}</Descriptions.Item>
          <Descriptions.Item label="Courses">
            {selectedTask?.courses.map(course => (
              <Tag color={course?.isActive ? 'green' : 'red'} key={course.name}>
                <Typography.Text>{course.name}</Typography.Text>
              </Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="GitHub PR Required">
            <Switch checked={selectedTask?.githubPrRequired} disabled />
          </Descriptions.Item>
          <Descriptions.Item label="Tags">
            {selectedTask?.tags.map(tag => (
              <Tag color="blue" key={tag}>
                {tag}
              </Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>

        {selectedTask?.attributes?.public?.questions && (
          <>
            <Divider />
            <Descriptions title="Test Settings" bordered column={4}>
              <Descriptions.Item label="Max Attempts Number">
                {selectedTask?.attributes?.public?.maxAttemptsNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Number of Questions">
                {selectedTask?.attributes?.public?.numberOfQuestions}
              </Descriptions.Item>
              <Descriptions.Item label="Strict Attempts Mode">
                <Switch checked={selectedTask?.attributes?.public?.strictAttemptsModes} disabled />
              </Descriptions.Item>
              <Descriptions.Item label="Threshold Percentage">
                {selectedTask?.attributes?.public?.tresholdPercentage}
              </Descriptions.Item>
            </Descriptions>
            <List
              itemLayout="horizontal"
              dataSource={selectedTask?.attributes.public.questions}
              renderItem={(item: Record<string, any>, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.question}
                    description={item.answers.map((answer: string, indexAnswer: number) => (
                      <Checkbox
                        key={indexAnswer}
                        checked={selectedTask?.attributes.answers[index].includes(indexAnswer)}
                      >
                        {answer}
                      </Checkbox>
                    ))}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </AdminPageLayout>
  );
}
export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager]} adminOnly>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
