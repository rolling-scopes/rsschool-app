
import { MentorStats } from 'common/models/profile';
import { Modal, Typography, Tag, Row, Col } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';

const { Text } = Typography;

import { GithubOutlined, LockFilled } from '@ant-design/icons';

type Props = {
  stats: MentorStats;
  isVisible: boolean;
  onHide: () => void;
};

const MentorStatsModal = (props: Props) => {


    

    

    const { stats, isVisible, onHide } = props;
    const { courseName, students } = stats;

    return (
      <Modal title={`${courseName} statistics`} open={isVisible} onCancel={onHide} footer={null} width={'80%'}>
        <Row gutter={[16, 16]}>
          {students?.map(({ name, githubId, isExpelled, totalScore, repoUrl }) => {
            const profile = `/profile?githubId=${githubId}`;
            const guithubLink = `https://github.com/${githubId}`;

            return (
              <Col
                key={`mentor-stats-modal-student-${githubId}`}
                xs={{ span: 24 }}
                sm={{ span: 12 }}
                md={{ span: 8 }}
                lg={{ span: 6 }}
              >
                <Row style={{ marginBottom: 24 }} justify="space-between">
                  <Col>
                    <div style={{ fontSize: 16, marginBottom: 16 }}>
                      <GithubAvatar githubId={githubId} size={48} style={{ marginRight: 24 }} />
                      <Text strong>
                        <a href={profile}>{name}</a>
                      </Text>
                    </div>
                    <p style={{ marginBottom: 5 }}>
                      {isExpelled ? <Tag color="red">expelled</Tag> : <Tag color="green">active</Tag>}
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      Score: <Text mark>{totalScore}</Text>
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      <GithubOutlined />{' '}
                      <a href={guithubLink} target="_blank">
                        {githubId}
                      </a>
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      <LockFilled />{' '}
                      <a href={repoUrl} target="_blank">
                        {repoUrl?.split('/').pop()}
                      </a>
                    </p>
                  </Col>
                </Row>
              </Col>
            );
          })}
        </Row>
      </Modal>
    ); 
};




export default MentorStatsModal;
