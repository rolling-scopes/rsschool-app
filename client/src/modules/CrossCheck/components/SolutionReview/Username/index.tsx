import { Typography } from 'antd';
import { CrossCheckMessageAuthor, CrossCheckMessageAuthorRole } from 'services/course';
import { GithubUserLink } from 'components/GithubUserLink';

type Props = {
  reviewNumber: number;
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageAuthorRole;
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
    case CrossCheckMessageAuthorRole.Reviewer:
      return `Reviewer ${reviewNumber + 1}${author && !areContactsVisible ? ' (hidden)' : ''}`;

    case CrossCheckMessageAuthorRole.Student:
    default:
      return `Student${author && !areContactsVisible ? ' (hidden)' : ''}`;
  }
}
