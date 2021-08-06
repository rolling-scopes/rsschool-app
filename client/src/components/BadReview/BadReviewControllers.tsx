import { Select, Row, Button, Col, Modal, message, Spin } from 'antd';
import { useMemo, useState, useEffect } from 'react';
import { CheckService } from 'services/check';
import { CourseTaskDetails } from 'services/course';
import { BadReviewTable } from './BadReviewTable';

interface IBadReviewControllersProps {
  courseTasks: CourseTaskDetails[];
}

export interface IBadReview {
  checkerScore: number;
  comment?: string;
  taskName: string;
  checkerGithubId: string;
  studentGithubId: string;
  studentAvgScore?: number;
}

export type checkType = 'Bad comment' | 'Did not check' | 'No type';

export function BadReviewControllers({ courseTasks }: IBadReviewControllersProps) {
  const { Option } = Select;
  const [taskId, setTaskId] = useState<number>();
  const [data, setData] = useState<IBadReview[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [checkType, setCheckType] = useState<checkType>();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const checkService = useMemo(() => new CheckService(), []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const buttonHandler = (type: checkType) => {
    setCheckType(type);
    showModal();
  };

  useEffect(() => setCheckType('No type'), [taskId]);

  useEffect(() => {
    async function getData(): Promise<void> {
      if (taskId && checkType) {
        setIsLoading(true);
        const dataFromService = await checkService.getData(taskId, checkType);
        setData(dataFromService);
        setIsLoading(false);
      }
    }
    getData();
  }, [checkType]);

  return (
    <>
      <Row gutter={16} justify="start" style={{ marginBottom: '10px' }}>
        <Col>
          <Select placeholder="Select task" style={{ width: 200 }} onChange={(value: number) => setTaskId(value)}>
            {courseTasks.map(task => (
              <Option key={task.id} value={task.id}>
                {task.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button type="primary" danger onClick={() => buttonHandler('Bad comment')} disabled={!taskId}>
            Bad comment
          </Button>
        </Col>
        <Col>
          <Button type="primary" danger onClick={() => buttonHandler('Did not check')} disabled={!taskId}>
            Didn't check
          </Button>
        </Col>
      </Row>
      <Modal
        title={`Bad checkers in ${checkType}`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
      >
        {isLoading || !data ? <Spin /> : <BadReviewTable data={data} type={checkType!} />}
      </Modal>
    </>
  );
}
