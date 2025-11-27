import { Flex, Space, theme, Typography } from 'antd';
import { formatDate } from '@client/services/formatter';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';

const { Text } = Typography;

export function DateWidget({ date }: { date?: string }) {
  if (!date) {
    return null;
  }
  const { token } = theme.useToken();
  return (
    <Flex gap="0.2em" vertical>
      <Text style={{ color: token.colorTextTertiary, fontSize: '1em' }}>Date</Text>
      <Space>
        <CalendarOutlined size={24} />
        <Text data-testid="date-widget">{formatDate(date)}</Text>
      </Space>
    </Flex>
  );
}
