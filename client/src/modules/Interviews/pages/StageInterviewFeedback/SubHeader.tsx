import { Col, Space, Tag, Typography } from 'antd';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import css from 'styled-jsx/css';
import { useRouter } from 'next/router';

type Props = {
  isCompleted: boolean;
};

export function SubHeader(props: Props) {
  const { isCompleted } = props;
  const router = useRouter();

  return (
    <Space align="center" size="middle" className={containerClassName}>
      <Col />
      <ArrowLeftOutlined onClick={router.back} />
      <Typography.Text strong>Feedback form</Typography.Text>
      <Tag color={isCompleted ? 'green' : undefined}>{isCompleted ? 'Completed' : 'Uncompleted'}</Tag>
      {containerStyles}
    </Space>
  );
}

const { className: containerClassName, styles: containerStyles } = css.resolve`
  div {
    border-bottom: 1px solid rgba(240, 242, 245, 1);
    padding: 24px;
  }
`;
