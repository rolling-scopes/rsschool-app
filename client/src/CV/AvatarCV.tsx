import * as React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

type Props = {
  src: string | null;
};

function AvatarCV(props: Props) {
  const src = props.src ?? undefined;
  const icon = src ? null : <UserOutlined />;
  return <Avatar src={src} icon={icon} size={120} />;
}

export default AvatarCV;
