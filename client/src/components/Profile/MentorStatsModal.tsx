import * as React from 'react';
import { MentorStats } from '../../../../common/models/profile';
import {
  Modal,
  Avatar,
  Typography,
  Tag,
  Row,
  Col,
} from 'antd';

const { Text } = Typography;

import {
  GithubOutlined,
  LockFilled,
} from '@ant-design/icons';

type Props = {
  stats: MentorStats;
  isVisible: boolean;
  onHide: () => void;
};

class MentorStatsModal extends React.Component<Props> {
  render() {
    const { stats, isVisible, onHide } = this.props;
    const { courseFullName, students, courseName } = stats;
    const courseYearPostfix = courseName.replace(/ /gi, '');

    return (
      <Modal
        title={`${courseFullName} statistics`}
        visible={isVisible}
        onCancel={onHide}
        footer={null}
        width={'80%'}
      >
        <Row gutter={[16, 16]}>
        {
          students.map(({ name, githubId, isExpelled, totalScore }) => {
            const profile = `/profile?githubId=${githubId}`;
            const guithubLink = `https://github.com/${githubId}`;
            const privateRepoLink = `https://github.com/rolling-scopes-school/${githubId}-${courseYearPostfix}`;

            return (
              <Col
                key={`mentor-stats-modal-student-${githubId}`}
                xs={{span: 24}}
                sm={{span: 12}}
                md={{span: 8}}
                lg={{span: 6}}
              >
                <Row style={{ marginBottom: 24 }}>
                  <Col>
                    <Avatar
                      src={`${guithubLink}.png?size=${128}`}
                      alt={`${githubId} avatar`}
                      size={64}
                      style={{ marginRight: 24 }}
                    />
                  </Col>
                  <Col>
                    <p style={{ fontSize: 16 }}>
                      <Text strong>
                        <a href={profile}>
                          {name}
                        </a>
                      </Text>
                    </p>
                    <p style={{ marginBottom: 5 }}>
                    {
                      isExpelled ?
                        <Tag color="red">expelled</Tag> :
                        <Tag color="green">active</Tag>
                    }
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      Score:  <Text mark>{totalScore}</Text>
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      <GithubOutlined /> <a href={guithubLink} target="_blank">{githubId}</a>
                    </p>
                    <p style={{ marginBottom: 5 }}>
                      <LockFilled /> <a href={privateRepoLink} target="_blank">
                        {`${githubId}-${courseYearPostfix}`}
                      </a>
                    </p>
                  </Col>
                </Row>
              </Col>
            )
          })
        }
        </Row>
      </Modal>
    );
  }
}

export default MentorStatsModal;
