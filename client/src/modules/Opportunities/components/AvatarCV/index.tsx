import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

type Props = {
  src: string | null;
};

const AVATAR_SIZE = 80;

export const AvatarCV = (props: Props) => {
  const src = props.src ?? undefined;
  const icon = src ? null : <UserOutlined />;
  return <Avatar src={src} icon={icon} size={AVATAR_SIZE} />;
};
