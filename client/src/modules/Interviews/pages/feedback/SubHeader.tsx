import { Col, Space, Tag, Typography } from 'antd';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import css from 'styled-jsx/css';

type Props = {
  completed: boolean;
};

export function SubHeader(props: Props) {
  const { completed } = props;
  return (
    <Space align="center" size="middle" className={containerClassName}>
      <Col />
      <ArrowLeftOutlined />
      <Typography.Text strong>Feedback form</Typography.Text>
      <Tag color={completed ? 'green' : undefined}>{completed ? 'Completed' : 'Uncompleted'}</Tag>
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
