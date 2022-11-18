import { Typography } from 'antd';
import { CrossCheckMessageAuthor, CrossCheckMessageAuthorRole } from 'services/course';
import { GithubUserLink } from 'components/GithubUserLink';

export type UsernameProps = {
  reviewNumber: number;
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageAuthorRole;
  areContactsVisible: boolean;
};

function Username(props: UsernameProps) {
  const { author, areContactsVisible } = props;

  return author && areContactsVisible ? (
    <GithubUserLink value={author.githubId} isUserIconHidden={true} />
  ) : (
    <Typography.Text>{createFakeUsername(props)}</Typography.Text>
  );
}

function createFakeUsername(props: UsernameProps): string {
  const { reviewNumber, author, role, areContactsVisible } = props;

  switch (role) {
    case CrossCheckMessageAuthorRole.Reviewer:
      return `Reviewer ${reviewNumber + 1}${author && !areContactsVisible ? ' (hidden)' : ''}`;

    case CrossCheckMessageAuthorRole.Student:
    default:
      return `Student${author && !areContactsVisible ? ' (hidden)' : ''}`;
  }
}

export default Username;
