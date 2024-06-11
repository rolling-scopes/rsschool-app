import { Button, Card, Col, Divider, Row, Typography } from 'antd';
import { TaskCardColumn } from '..';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { AutoTestTaskDto } from 'api';

const { Paragraph } = Typography;

export interface AutoTestTaskCardProps {
  courseTask: AutoTestTaskDto;
  handleSelectTask: (task: AutoTestTaskDto) => void;
}

function AutoTestTaskCard({ courseTask, handleSelectTask }: AutoTestTaskCardProps) {
  const columns = [
    {
      label: 'Max attempts number',
      value: courseTask.attributes?.public?.maxAttemptsNumber ?? <>&ndash;</>,
    },
    {
      label: 'Number of Questions',
      value: courseTask.attributes?.public?.numberOfQuestions ?? <>&ndash;</>,
    },
    {
      label: 'Strict attempts mode',
      value: courseTask.attributes?.public?.strictAttemptsMode ? (
        <CheckCircleOutlined style={{ fontSize: 24 }} />
      ) : (
        <CloseCircleOutlined style={{ fontSize: 24 }} />
      ),
    },
    {
      label: 'Threshold percentage',
      value: courseTask.attributes?.public?.tresholdPercentage ?? <>&ndash;</>,
    },
  ];

  return (
    <Card>
      <Row gutter={[24, 4]}>
        <Col span={24}>
          <Paragraph
            ellipsis={{
              expandable: false,
              rows: 1,
            }}
          >
            <Typography.Text strong>{' ' + courseTask.name} </Typography.Text>
          </Paragraph>
        </Col>
        <Col span={24}>
          <Button type="primary" onClick={() => handleSelectTask(courseTask)}>
            Preview Task
          </Button>
        </Col>
      </Row>
      <Divider />
      <Row gutter={[8, 8]}>
        {columns.map(item => (
          <Col span={12} key={item.label}>
            <TaskCardColumn {...item} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default AutoTestTaskCard;
