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
  areStudentContactsVisible: boolean;
};

export function CommentUsername(props: Props) {
  const { author, areStudentContactsVisible } = props;

  return author && areStudentContactsVisible ? (
    <GithubUserLink value={author.githubId} isUserIconHidden={true} />
  ) : (
    <Typography.Text>{createFakeUsername(props)}</Typography.Text>
  );
}

function createFakeUsername(props: Props): string {
  const { reviewNumber, author, role, areStudentContactsVisible } = props;

  switch (role) {
    case TaskSolutionResultRole.Checker:
      return `Checker ${reviewNumber + 1}${author && !areStudentContactsVisible ? ' (hidden)' : ''}`;

    case TaskSolutionResultRole.Student:
    default:
      return `Student${author && !areStudentContactsVisible ? ' (hidden)' : ''}`;
  }
}
