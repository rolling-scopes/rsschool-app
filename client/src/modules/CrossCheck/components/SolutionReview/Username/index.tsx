import { Typography } from 'antd';
import { Discord } from 'api';
import { TaskSolutionResultRole } from 'services/course';
import { GithubUserLink } from 'components/GithubUserLink';

type Props = {
  reviewNumber: number;
  author: {
    id?: number;
    name?: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  role: TaskSolutionResultRole;
  areContactsVisible: boolean;
};

export function Username(props: Props) {
  const { author, areContactsVisible } = props;

  return author && areContactsVisible ? (
    <GithubUserLink value={author.githubId} isUserIconHidden={true} />
  ) : (
    <Typography.Text>{createFakeUsername(props)}</Typography.Text>
  );
}

function createFakeUsername(props: Props): string {
  const { reviewNumber, author, role, areContactsVisible } = props;

  switch (role) {
    case TaskSolutionResultRole.Reviewer:
      return `Reviewer ${reviewNumber + 1}${author && !areContactsVisible ? ' (hidden)' : ''}`;

    case TaskSolutionResultRole.Student:
    default:
      return `Student${author && !areContactsVisible ? ' (hidden)' : ''}`;
  }
}
