import { Space, Typography } from 'antd';
import Image from 'next/image';

const { Text } = Typography;

export function SolidarityUkraine() {
  return (
    <Space>
      <Image src="/static/svg/solidarityUkraine.svg" alt="Stand With Ukraine" width={60} height={38} />
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          #StandWithUkraine
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          #StopWar
        </Text>
      </div>
    </Space>
  );
}
