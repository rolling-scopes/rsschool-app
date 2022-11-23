import { CDN_AVATARS_URL } from 'configs/cdn';
import { Avatar } from 'antd';
import { CrossCheckMessageAuthor, CrossCheckMessageAuthorRole } from 'services/course';
import { AVATAR_ICON_PATH } from 'modules/CrossCheck/constants';

export type UserAvatarProps = {
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageAuthorRole;
  areContactsVisible: boolean;
  size: 24 | 32;
};

function UserAvatar(props: UserAvatarProps) {
  const { size } = props;

  return <Avatar size={size} src={createAvatarPath(props)} />;
}

function createAvatarPath(props: UserAvatarProps): string {
  const { author, role, areContactsVisible, size } = props;

  switch (role) {
    case CrossCheckMessageAuthorRole.Reviewer:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return AVATAR_ICON_PATH.expert;
      }

    case CrossCheckMessageAuthorRole.Student:
    default:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return AVATAR_ICON_PATH.thanks;
      }
  }
}

export default UserAvatar;
