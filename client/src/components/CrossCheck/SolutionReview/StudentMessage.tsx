import { CDN_AVATARS_URL } from 'configs/cdn';
import { Avatar, Col, Comment, Row, Typography } from 'antd';
import { Discord } from 'api';
import { useLocalStorage } from 'react-use';
import { formatDateTime } from 'services/formatter';
import { GithubUserLink } from 'components/GithubUserLink';
import PreparedComment from 'components/Forms/PreparedComment';

enum LocalStorage {
  AreStudentContactsVisible = 'crossCheckAreStudentContactsVisible',
}

type Props = {
  comment: string;
  author: {
    name: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  updatedDate: string;
};

export function StudentMessage({ comment, author, updatedDate }: Props) {
  const [areStudentContactsVisible = true, setAreStudentContactsHidden] = useLocalStorage<boolean>(
    LocalStorage.AreStudentContactsVisible,
  );

  return (
    <Col>
      <Comment
        avatar={
          <Avatar
            size={24}
            src={
              areStudentContactsVisible && author
                ? `${CDN_AVATARS_URL}/${author.githubId}.png?size=48`
                : '/static/svg/badges/ThankYou.svg'
            }
          />
        }
        content={
          <>
            <Row>
              {areStudentContactsVisible && author ? (
                <GithubUserLink value={author.githubId} isUserIconHidden={true} />
              ) : (
                <Typography.Text>
                  {'Student'} {/* i */ +1}
                  {!areStudentContactsVisible && author && ' (hidden)'}
                </Typography.Text>
              )}
            </Row>

            <Row>
              <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                {formatDateTime(updatedDate)}
              </Typography.Text>
            </Row>

            <Row>
              <PreparedComment text={comment} />
            </Row>
          </>
        }
      />
    </Col>
  );
}
