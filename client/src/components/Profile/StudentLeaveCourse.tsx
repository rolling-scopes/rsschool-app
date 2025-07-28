import { WarningOutlined } from '@ant-design/icons';
import { Divider, Modal, theme, Typography } from 'antd';

const { Title, Paragraph } = Typography;

type StudentLeaveCourseProps = {
  isOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
};

const messages = ['Are you sure you want to leave the course?', 'Your learning will be stopped.'];

const messagesRu = ['Вы уверены, что хотите покинуть курс?', 'Ваше обучение будет прекращено.'];

export default function StudentLeaveCourse({ isOpen, onOk, onCancel }: StudentLeaveCourseProps) {
  const {
    token: { colorError },
  } = theme.useToken();
  return (
    <Modal
      title={
        <Title level={4}>
          <WarningOutlined style={{ color: colorError }} /> Leaving Course ?
        </Title>
      }
      open={isOpen}
      onOk={onOk}
      okText="Leave Course"
      okButtonProps={{ danger: true }}
      onCancel={onCancel}
      cancelText="Continue studying"
    >
      <>
        <Divider />
        {messages.map((text, i) => (
          <Paragraph key={i}>{text}</Paragraph>
        ))}
        <Divider />
        {messagesRu.map((text, i) => (
          <Paragraph key={i}>{text}</Paragraph>
        ))}
      </>
    </Modal>
  );
}
