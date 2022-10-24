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
  size: number;
};

export function CommentAvatar(props: Props) {
  const { size } = props;

  return <Avatar size={size} src={createAvatarPath(props)} />;
}

function createAvatarPath(props: Props) {
  const { author, role, areStudentContactsVisible } = props;

  switch (role) {
    case TaskSolutionResultRole.Checker:
      if (author && areStudentContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=48`;
      } else {
        return author ? '/static/svg/badges/TopPerformer.svg' : '/static/svg/badges/ThankYou.svg';
      }

    case TaskSolutionResultRole.Student:
    default:
      if (author && areStudentContactsVisible) {
        return `${CDN_AVATARS_URL}/${author.githubId}.png?size=48`;
      } else {
        return '/static/svg/badges/Hero.svg';
      }
  }
}
