import * as React from 'react';
import { Avatar } from 'antd';
import { CDN_AVATARS_URL } from 'configs/cdn';

type Props = {
  githubId?: string;
  size: 24 | 32 | 48 | 96;
  style?: React.CSSProperties;
  alt?: string;
};

export function GithubAvatar({ githubId, size, style }: Props) {
  if (!githubId) {
    return <Avatar size={size} style={style} />;
  }
  return <Avatar src={`${CDN_AVATARS_URL}/${githubId}.png?size=${size * 2}`} size={size} style={style} />;
}
