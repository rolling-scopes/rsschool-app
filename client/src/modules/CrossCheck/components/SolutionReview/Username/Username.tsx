import { Typography } from 'antd';
import { CrossCheckMessageAuthor } from 'services/course';
import { GithubUserLink } from '@client/shared/components/GithubUserLink';
import { CrossCheckMessageDtoRoleEnum } from '@client/api';

const { Text } = Typography;

export type UsernameProps = {
  reviewNumber: number;
  author: CrossCheckMessageAuthor | null;
  role: CrossCheckMessageDtoRoleEnum;
  areContactsVisible: boolean;
};

function Username(props: UsernameProps) {
  const { author, areContactsVisible } = props;

  return author && areContactsVisible ? (
    <GithubUserLink value={author.githubId} isUserIconHidden={true} />
  ) : (
    <Text>{createFakeUsername(props)}</Text>
  );
}

function createFakeUsername(props: UsernameProps): string {
  const { reviewNumber, author, role, areContactsVisible } = props;

  switch (role) {
    case CrossCheckMessageDtoRoleEnum.Reviewer:
      return `Reviewer ${reviewNumber + 1}${author && !areContactsVisible ? ' (hidden)' : ''}`;

    case CrossCheckMessageDtoRoleEnum.Student:
    default:
      return `Student${author && !areContactsVisible ? ' (hidden)' : ''}`;
  }
}

export default Username;
