import { Tag, theme, Typography } from 'antd';

const { Text } = Typography;

export function ScoreWidget({ score }: { score: number }) {
  const { token } = theme.useToken();
  return (
    <Text>
      Score: <Tag color={token.colorBgSpotlight}>{score}</Tag>
    </Text>
  );
}
