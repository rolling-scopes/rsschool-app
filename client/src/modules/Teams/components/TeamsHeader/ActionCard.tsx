import { Button, Card, Col, Popconfirm, Space, Typography } from 'antd';

const { Title, Text } = Typography;

type Props = {
  title: string;
  text: string;
  buttonCaption: string;
  onClick: () => void;
};

export function ActionCard({ title, text, buttonCaption, onClick }: Props) {
  return (
    <Col xs={24} sm={12}>
      <Card title={<Title level={5}>{title}</Title>} style={{ backgroundColor: '#E6F7FF' }}>
        <Space size={12} direction="vertical">
          <Text type="secondary">{text}</Text>
          <Popconfirm title={<>Are you sure you want to {buttonCaption.toLowerCase()}?</>} onConfirm={onClick}>
            <Button>{buttonCaption}</Button>
          </Popconfirm>
        </Space>
      </Card>
    </Col>
  );
}
