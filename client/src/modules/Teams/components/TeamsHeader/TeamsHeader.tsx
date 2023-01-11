import { Row, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

type Props = {
  courseAlias: string;
  isStudent: boolean;
  distributedStudent: boolean;
};

export default function TeamsHeader({ courseAlias, isStudent, distributedStudent }: Props) {
  return (
    <Space direction="vertical" size={16}>
      <Row justify="start" align="middle">
        <Space size={24}>
          <Space size={12}>
            <Link href={`team-distributions?course=${courseAlias}`}>
              <ArrowLeftOutlined />
            </Link>
            <Title level={4} style={{ marginBottom: 0 }}>
              Teams
            </Title>
            <Text type="secondary">Distribution of participants per team</Text>
          </Space>
          {isStudent && (
            <Space size={12}>
              <Text type="secondary">My status:</Text>
              {distributedStudent ? (
                <Tag icon={<ClockCircleOutlined />} color="green">
                  distributed
                </Tag>
              ) : (
                <Tag icon={<ClockCircleOutlined />}>without team</Tag>
              )}
            </Space>
          )}
        </Space>
      </Row>
      <Title level={5} style={{ marginLeft: 27 }}>
        The roles of team members are determined automatically.
      </Title>
    </Space>
  );
}
