import * as React from 'react';
import { Avatar } from 'antd';

type Props = {
  githubId?: string;
  size: 24 | 32 | 48 | 96;
  style?: React.CSSProperties;
};

export function GithubAvatar({ githubId, size, style }: Props) {
  if (!githubId) {
    return <Avatar size={size} style={style} />;
  }
  return <Avatar src={`https://github.com/${githubId}.png?size=${size * 2}`} size={size} style={style} />;
}
