import { CDN_AVATARS_URL } from 'configs/cdn';
import { ScoreIcon } from 'components/Icons/ScoreIcon';
import { Avatar, Button, Col, Comment, Divider, Input, Row, Switch, Typography } from 'antd';
import { useLocalStorage } from 'react-use';
import { SolutionReviewType } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { GithubUserLink } from 'components/GithubUserLink';
import PreparedComment from 'components/Forms/PreparedComment';
import { StudentContacts } from '../StudentContacts';
import { Message } from './Message';

enum LocalStorage {
  AreStudentContactsVisible = 'crossCheckAreStudentContactsVisible',
}

type Props = {
  children?: JSX.Element;
  sessionGithubId: string;
  index: number;
  review: SolutionReviewType;
  maxScore?: number;
  areMessagesVisible?: boolean;
};

export function SolutionReview(props: Props) {
  const { children, sessionGithubId, index, review, maxScore, areMessagesVisible = true } = props;
  const { checker, comment, score, checkDate } = review;

  const [areStudentContactsVisible = true, setAreStudentContactsHidden] = useLocalStorage<boolean>(
    LocalStorage.AreStudentContactsVisible,
  );

  const handleStudentContactsVisibilityChange = () => {
    setAreStudentContactsHidden(!areStudentContactsVisible);
  };

  return (
    <Col>
      {/* <Row gutter={8} style={{ margin: '8px 0' }}>
        <Col>
          <Typography.Text>Student Contacts</Typography.Text>
        </Col>
        <Col>
          <Switch
            size={'small'}
            defaultChecked={areStudentContactsVisible}
            onChange={handleStudentContactsVisibilityChange}
          />
        </Col>
      </Row> */}

      <Row>
        <Col span={24}>
          <Divider style={{ margin: '8px 0' }} />
        </Col>
      </Row>

      <Row>
        <Col>
          <Comment
            avatar={
              <Avatar
                size={32}
                src={
                  areStudentContactsVisible && checker
                    ? `${CDN_AVATARS_URL}/${checker.githubId}.png?size=48`
                    : '/static/svg/badges/ThankYou.svg'
                }
              />
            }
            content={
              <>
                <Row>
                  {areStudentContactsVisible && checker ? (
                    <GithubUserLink value={checker.githubId} isUserIconHidden={true} />
                  ) : (
                    <Typography.Text>
                      {'Student'} {index + 1}
                      {!areStudentContactsVisible && checker && ' (hidden)'}
                    </Typography.Text>
                  )}
                </Row>

                <Row>
                  <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                    {formatDateTime(checkDate)}
                  </Typography.Text>
                </Row>

                <Row gutter={4} align="middle">
                  <Col>
                    <ScoreIcon maxScore={maxScore} score={score} />
                  </Col>
                  <Col>
                    <Typography.Text>{score}</Typography.Text>
                  </Col>
                </Row>

                <Row style={{ marginBottom: 24 }}>
                  <Typography.Text style={{ fontSize: 12, lineHeight: '12px' }} type="secondary">
                    maximum score: {maxScore ?? 'unknown'}
                  </Typography.Text>
                </Row>

                <Row>
                  <PreparedComment text={comment} />
                </Row>

                <Row>{areStudentContactsVisible && checker && <StudentContacts discord={checker.discord} />}</Row>
              </>
            }
          >
            {children}

            {/* {comments.map(({ comment, updatedDate, author, score }) => (
          <Message comment={comment} updatedDate={updatedDate} author={author} />
        ))} */}

            {areMessagesVisible && (
              <Comment
                avatar={
                  <Avatar
                    size={24}
                    src={
                      /* checker ? `${CDN_AVATARS_URL}/${sessionGithubId}.png?size=48` : '/static/svg/badges/ThankYou.svg' */
                      /* TODO если я аноним то не показывать мою аватарку */
                      `${CDN_AVATARS_URL}/${sessionGithubId}.png?size=48`
                    }
                  />
                }
                content={
                  <>
                    <Row>
                      <Col span={24}>
                        <Input.TextArea rows={3} showCount maxLength={512} />
                      </Col>
                    </Row>

                    <Row>
                      <Button type="primary">Send Message</Button>
                    </Row>
                  </>
                }
              />
            )}
          </Comment>
        </Col>
      </Row>

      <style jsx>{`
        :global(.ant-comment-avatar) {
          position: sticky;
          top: 16px;
          align-self: start;
        }

        :global(.ant-comment-avatar img) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </Col>
  );
}
