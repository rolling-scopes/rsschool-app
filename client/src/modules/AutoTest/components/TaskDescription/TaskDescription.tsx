import React from 'react';
import { Row, Col, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getAutoTestRoute } from 'services/routes';
import { TaskDeadlineDate } from '..';
import { CourseTaskDetailedDto } from 'api';

const { Title, Text, Link } = Typography;

type TaskDescriptionProps = {
  courseAlias: string;
  score: number;
  courseTask: CourseTaskDetailedDto;
};

function TaskDescription({ courseAlias, courseTask, score }: TaskDescriptionProps) {
  const { descriptionUrl, name, studentStartDate, studentEndDate } = courseTask;

  return (
    <Row style={{ background: 'white', margin: '-15px -16px 24px', padding: '16px 24px' }}>
      <Col flex="auto">
        <Title level={3}>
          <Space size={24}>
            <Link href={getAutoTestRoute(courseAlias)}>
              <ArrowLeftOutlined />
            </Link>
            {name}
          </Space>
        </Title>
      </Col>
      <Col flex="none">
        <TaskDeadlineDate
          startDate={studentStartDate}
          endDate={studentEndDate}
          score={score}
          format="YYYY-MM-DD HH:mm"
        />
      </Col>
      {descriptionUrl ? (
        <Col span={24}>
          <Space>
            <Text type="secondary">Description: </Text>
            <Link href={descriptionUrl} target="_blank">
              {descriptionUrl}
            </Link>
          </Space>
        </Col>
      ) : null}
    </Row>
  );
}

export default TaskDescription;
