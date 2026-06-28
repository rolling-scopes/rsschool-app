import { CDN_AVATARS_URL } from '@client/configs/cdn';
import { Avatar } from 'antd';
import { CrossCheckMessageAuthor } from '@client/services/course';
import { AVATAR_ICON_PATH } from '@client/modules/CrossCheck/constants';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';

export type UserAvatarProps = {
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageDtoRoleEnum;
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
    case CrossCheckMessageDtoRoleEnum.Reviewer:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      }
      return AVATAR_ICON_PATH.expert;

    case CrossCheckMessageDtoRoleEnum.Student:
    default:
      if (author && areContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      }
      return AVATAR_ICON_PATH.thanks;
  }
}

export default UserAvatar;
