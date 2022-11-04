import { Fragment, useState } from 'react';
import { CDN_AVATARS_URL } from 'configs/cdn';
import { ScoreIcon } from './Icons/ScoreIcon';
import { Avatar, Button, Col, Comment, Divider, Row, Switch, Typography } from 'antd';
import { useLocalStorage } from 'react-use';
import { Feedback } from 'services/course';
import { formatDateTime } from 'services/formatter';
import { GithubUserLink } from 'components/GithubUserLink';
import PreparedComment from './Forms/PreparedComment';
import { StudentContacts } from './CrossCheck/StudentContacts';
import { CrossCheckCriteriaModal } from './CrossCheck/criteria/CrossCheckCriteriaModal';
import { CrossCheckCriteriaData } from './CrossCheck/CrossCheckCriteriaForm';

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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModaldata] = useState<CrossCheckCriteriaData[]>([]);

  const handleStudentContactsVisibilityChange = () => {
    setAreStudentContactsHidden(!areStudentContactsVisible);
  };

  const showModal = (modalData: CrossCheckCriteriaData[]) => {
    setIsModalVisible(true);
    setModaldata(modalData);
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

      {comments.map(({ comment, updatedDate, author, score, criteria }, i) => (
        <Fragment key={i}>
          <CrossCheckCriteriaModal
            modalInfo={modalData}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
          />
          <Row>
            <Divider style={{ margin: '8px 0' }} />
          </Row>
          <Comment
            avatar={
              <Avatar
                size={32}
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
                      {'Student'} {i + 1}
                      {!areStudentContactsVisible && author && ' (hidden)'}
                    </Typography.Text>
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

                <Row style={{ marginBottom: 10 }}>
                  <Typography.Text style={{ fontSize: 12, lineHeight: '12px' }} type="secondary">
                    maximum score: {maxScore ?? 'unknown'}
                  </Typography.Text>
                </Row>
                <Row style={{ marginBottom: 10 }}>
                  {criteria?.length && <Button onClick={() => showModal(criteria)}>Show detailed feedback</Button>}
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
