import { Row, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

type Props = {
  courseAlias: string;
};

export default function TeamsHeader({ courseAlias }: Props) {
  return (
    <Space direction="vertical" size={16}>
      <Row justify="start" align="middle">
        <Space size={12}>
          <Link href={`team-distributions?course=${courseAlias}`}>
            <ArrowLeftOutlined />
          </Link>
          <Title level={4} style={{ marginBottom: 0 }}>
            Teams
          </Title>
          <Text type="secondary">Distribution of participants per team</Text>
        </Space>
      </Row>
      <Title level={5} style={{ marginLeft: 27 }}>
        The roles of team members are determined automatically.
      </Title>
    </Space>
  );
}
