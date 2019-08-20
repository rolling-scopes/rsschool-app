import * as React from 'react';
import { Avatar } from 'antd';

type Props = {
  githubId: string;
  size: 24 | 48 | 96;
};

export function GithubAvatar({ githubId, size }: Props) {
  return <Avatar src={`https://github.com/${githubId}.png?size${size * 2}`} size={size} />;
}
