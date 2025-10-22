import { useRequest } from 'ahooks';
import { Button, Col, Modal, Row, Select, Spin } from 'antd';
import { CoursesTasksApi } from 'api';
import { useEffect, useState } from 'react';
import { CourseTaskDetails } from 'services/course';
import { BadReviewTable } from './BadReviewTable';

type Props = {
  courseTasks: CourseTaskDetails[];
  courseId: number;
};

export type checkType = 'badcomment' | 'didnotcheck' | undefined;

const courseTaskService = new CoursesTasksApi();

export function BadReviewControllers({ courseTasks, courseId }: Props) {
  const { Option } = Select;
  const [courseTaskId, setCourseTaskId] = useState<number>();
  const [checkType, setCheckType] = useState<checkType>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const dataRequest = useRequest(
    async () => {
      if (checkType === 'badcomment') {
        const { data } = await courseTaskService.getCourseTaskBadComments(courseId, courseTaskId as number);
        return data;
      }
      if (checkType === 'didnotcheck') {
        const { data } = await courseTaskService.getCourseTaskMaxScoreCheckers(courseId, courseTaskId as number);
        return data;
      }
      return [];
    },
    {
      ready: Boolean(courseTaskId) && Boolean(checkType),
    },
  );

  const handleCancel = () => setIsModalVisible(false);

  const buttonHandler = (type: checkType) => {
    setCheckType(type);
    setIsModalVisible(true);
  };

  useEffect(() => setCheckType(undefined), [courseTaskId]);

  return (
    <>
      <Row gutter={16} justify="start" style={{ marginBottom: '10px' }}>
        <Col>
          <Select
            placeholder="Select task"
            style={{ width: 200 }}
            onChange={(value: number) => setCourseTaskId(value)}
            showSearch
            optionFilterProp="label"
          >
            {courseTasks.map(task => (
              <Option key={task.id} value={task.id} label={task.name}>
                {task.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button
            type="primary"
            href={`/api/v2/courses/${courseId}/cross-checks/${courseTaskId}/csv`}
            disabled={!courseTaskId}
          >
            Download solutions urls
          </Button>
        </Col>
        <Col>
          <Button type="primary" danger onClick={() => buttonHandler('badcomment')} disabled={!courseTaskId}>
            Bad comment
          </Button>
        </Col>
        <Col>
          <Button type="primary" danger onClick={() => buttonHandler('didnotcheck')} disabled={!courseTaskId}>
            Didn't check
          </Button>
        </Col>
      </Row>
      <Modal
        open={isModalVisible}
        width={1200}
        style={{ top: 20 }}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" type="primary" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        {dataRequest.loading ? <Spin /> : null}
        {dataRequest.data && !dataRequest.loading ? <BadReviewTable data={dataRequest.data} type={checkType} /> : null}
      </Modal>
    </>
  );
}
