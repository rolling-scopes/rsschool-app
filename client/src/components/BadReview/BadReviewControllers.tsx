import { Select, Row, Button, Col, Modal, message, Spin } from 'antd';
import { useMemo, useState, useEffect, useRef } from 'react';
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

interface ICache {
  [x: number]: {
    [x: string]: IBadReview[];
  };
}

export type checkType = 'Bad comment' | 'Did not check';

export function BadReviewControllers({ courseTasks }: IBadReviewControllersProps) {
  const { Option } = Select;
  const cache = useRef<ICache>({});
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

  useEffect(() => {
    async function getData(): Promise<void> {
      if (taskId && checkType) {
        if (cache.current?.[taskId]?.[checkType]) {
          setData(cache.current[taskId][checkType]);
        } else {
          setIsLoading(true);
          let dataFromService: IBadReview[] = [];
          try {
            switch (checkType) {
              case 'Bad comment':
                dataFromService = await checkService.getBadComments(taskId);
                break;
              case 'Did not check':
                dataFromService = await checkService.getMaxScoreCheckers(taskId);
                break;
            }
          } catch (error) {
            message.error('Something went wrong');
          }
          cache.current = { ...cache.current, [taskId]: { ...cache.current[taskId], [checkType]: dataFromService } };
          setIsLoading(false);
          setData(dataFromService);
        }
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
      <Modal title={`💩 in ${checkType}`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={1000}>
        {isLoading || !data ? <Spin /> : <BadReviewTable data={data} type={checkType!} />}
      </Modal>
    </>
  );
}
