import { Row, Col, Space, Typography, theme } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getAutoTestRoute } from 'services/routes';
import { TaskDeadlineDate } from '..';
import { CourseTaskVerifications } from 'modules/AutoTest/types';

const { Title, Text, Link } = Typography;

type TaskDescriptionProps = {
  courseTask: CourseTaskVerifications;
  courseAlias: string;
};

function TaskDescription({ courseAlias, courseTask }: TaskDescriptionProps) {
  const { descriptionUrl, name, studentStartDate, studentEndDate, state } = courseTask;

  const { token } = theme.useToken();

  return (
    <Row style={{ background: token.colorBgContainer, padding: '16px 24px' }}>
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
          state={state}
          format="YYYY-MM-DD HH:mm"
        />
      </Col>
      {descriptionUrl ? (
        <Col span={24}>
          <Space align="start">
            <Text type="secondary">Description: </Text>
            <Link href={descriptionUrl} target="_blank" style={{ wordBreak: 'break-word' }}>
              {descriptionUrl}
            </Link>
          </Space>
        </Col>
      ) : null}
    </Row>
  );
}

export default TaskDescription;
