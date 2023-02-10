import { Badge, Space } from 'antd';
type Props = {
  count: number
}

const BadgeItem: React.FC<Props> = ({count}) => {
  return (
    <Space >
      <Badge count={count}  style={{backgroundColor: "#F0F0F0", color: "#000000", opacity: 0.45,}}  />
    </Space>
  );
};

export default BadgeItem;
