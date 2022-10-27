import { CDN_AVATARS_URL } from 'configs/cdn';
import { Avatar } from 'antd';
import { Discord } from 'api';
import { TaskSolutionResultRole } from 'services/course';

type Props = {
  author: {
    id?: number;
    name?: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  role: TaskSolutionResultRole;
  areStudentContactsVisible: boolean;
  size: 24 | 32;
};

export function CommentAvatar(props: Props) {
  const { size } = props;

  return <Avatar size={size} src={createAvatarPath(props)} />;
}

function createAvatarPath(props: Props): string {
  const { author, role, areStudentContactsVisible, size } = props;

  switch (role) {
    case TaskSolutionResultRole.Checker:
      if (author && areStudentContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return '/static/svg/crossCheck/Expert.svg';
      }

    case TaskSolutionResultRole.Student:
    default:
      if (author && areStudentContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=${size * 2}`;
      } else {
        return '/static/svg/crossCheck/Thanks.svg';
      }
  }
}
