import { Popconfirm, PopconfirmProps } from 'antd';

export const CustomPopconfirm = ({ placement, ...props }: PopconfirmProps) => {
  return <Popconfirm placement={placement ?? 'topRight'} {...props} />;
};
