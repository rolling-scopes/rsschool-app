import { CDN_AVATARS_URL } from 'configs/cdn';
import { Avatar } from 'antd';
import { Discord } from 'api';
import { TaskSolutionResultRole } from 'services/course';
import { AVATAR_ICON_PATH } from 'modules/CrossCheck/constants';

type Props = {
  author: {
    id?: number;
    name?: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  role: TaskSolutionResultRole;
  areContactsVisible: boolean;
  size: 24 | 32;
};

export function UserAvatar(props: Props) {
  const { size } = props;

  return <Avatar size={size} src={createAvatarPath(props)} />;
}

function createAvatarPath(props: Props): string {
  const { author, role, areContactsVisible, size } = props;

  switch (role) {
    case TaskSolutionResultRole.Reviewer:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return AVATAR_ICON_PATH.expert;
      }

    case TaskSolutionResultRole.Student:
    default:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return AVATAR_ICON_PATH.thanks;
      }
  }
}