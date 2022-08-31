import { Fragment } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { ScoreIcon } from './Icons/ScoreIcon';
import { Avatar, Col, Comment, Divider, Row, Switch, Typography } from 'antd';
import { useLocalStorage } from 'react-use';
import { Feedback } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { GithubUserLink } from 'components/GithubUserLink';
import PreparedComment from './Forms/PreparedComment';
import { StudentContacts } from './CrossCheck/StudentContacts';

enum LocalStorage {
  AreStudentContactsVisible = 'crossCheckAreStudentContactsVisible',
}

type Props = {
  feedback: Feedback | null;
  maxScore?: number;
};

export function CrossCheckComments({ feedback, maxScore }: Props) {
  if (!feedback || !feedback.comments || feedback.comments.length === 0) {
    return null;
  }

  const { comments } = feedback;
  const [areStudentContactsVisible = true, setAreStudentContactsHidden] = useLocalStorage<boolean>(
    LocalStorage.AreStudentContactsVisible,
  );

  const handleStudentContactsVisibilityChange = () => {
    setAreStudentContactsHidden(!areStudentContactsVisible);
  };

  return (
    <Col>
      <Row gutter={8} style={{ margin: '8px 0' }}>
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
      </Row>

      {comments.map(({ comment, updatedDate, author, score }, i) => (
        <Fragment key={i}>
          <Row>
            <Divider style={{ margin: '8px 0' }} />
          </Row>

          <Comment
            avatar={<UserOutlined />}
            content={
              <>
                <Row align="middle" gutter={3}>
                  {areStudentContactsVisible && author ? (
                    <Col>
                      <GithubUserLink value={author.githubId} />
                    </Col>
                  ) : (
                    <>
                      <Col>
                        <Avatar size={24} src="/static/svg/badges/ThankYou.svg" />
                      </Col>
                      <Col>
                        <Typography.Text>
                          {'Student'} {i + 1}
                          {!areStudentContactsVisible && author && ' (hidden)'}
                        </Typography.Text>
                      </Col>
                    </>
                  )}
                </Row>

                <Row>
                  <Typography.Text type="secondary" style={{ marginBottom: 8, fontSize: 12 }}>
                    {formatDateTime(updatedDate)}
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

                <Row>{areStudentContactsVisible && author && <StudentContacts discord={author.discord} />}</Row>
              </>
            }
          />
        </Fragment>
      ))}
    </Col>
  );
}
