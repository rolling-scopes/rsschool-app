import { Col, Space, Tag, Typography } from 'antd';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import { useRouter } from 'next/router';
import styles from './SubHeader.module.css';

type Props = {
  isCompleted: boolean;
};

export function SubHeader(props: Props) {
  const { isCompleted } = props;
  const router = useRouter();

  return (
    <Space align="center" size="middle" className={styles.container}>
      <Col />
      <ArrowLeftOutlined onClick={router.back} />
      <Typography.Text strong>Feedback form</Typography.Text>
      <Tag color={isCompleted ? 'green' : undefined}>{isCompleted ? 'Completed' : 'Uncompleted'}</Tag>
    </Space>
  );
}
