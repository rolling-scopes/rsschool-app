import { Row, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

type Props = {
  courseAlias: string;
};

export default function TeamsHeader({ courseAlias }: Props) {
  return (
    <Row justify="start" align="middle">
      <Space size={12}>
        <Link href={`team-distributions?course=${courseAlias}`}>
          <ArrowLeftOutlined style={{ width: 27 }} />
        </Link>
        <Title level={4} style={{ marginBottom: 0 }}>
          Teams
        </Title>
        <Text type="secondary">Distribution of participants per team</Text>
      </Space>
    </Row>
  );
}
