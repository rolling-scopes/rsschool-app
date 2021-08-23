import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export type Props = {
  title: string;
};

export function Info({ title }: Props) {
  return (
    <Tooltip title={title} color="#000000bf">
      <InfoCircleOutlined style={{ fontSize: 13 }} />
    </Tooltip>
  );
}
