import { Button, Card, Col, Divider, Row, Typography, Switch } from 'antd';
import { TaskCardColumn } from '..';
import { MinimizedAutoTestTaskDto } from 'api';
import Link from 'next/link';

const { Paragraph } = Typography;

export interface AutoTestTaskCardProps {
  courseTask: MinimizedAutoTestTaskDto;
}

function AutoTestTaskCard({ courseTask }: AutoTestTaskCardProps) {
  const columns = [
    {
      label: 'Max attempts number',
      value: courseTask.maxAttemptsNumber ?? <>&ndash;</>,
    },
    {
      label: 'Number of Questions',
      value: courseTask.numberOfQuestions ?? <>&ndash;</>,
    },
    {
      label: 'Strict attempts mode',
      value: <Switch checked={courseTask.strictAttemptsMode} />,
    },
    {
      label: 'Threshold percentage',
      value: courseTask.thresholdPercentage ?? <>&ndash;</>,
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
          <Link href={'/admin/auto-test-task?taskId=' + courseTask.id}>
            <Button type="primary">Preview Task</Button>
          </Link>
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
