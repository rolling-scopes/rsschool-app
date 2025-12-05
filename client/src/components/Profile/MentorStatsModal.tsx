import * as React from 'react';
import { MentorStats } from '@common/models/profile';
import { Card, Flex, Modal, Space } from 'antd';
import { GithubAvatar } from 'components/GithubAvatar';
import { GithubOutlined, LockFilled } from '@ant-design/icons';
import { ScoreWidget } from '@client/components/Profile/ui';

type Props = {
  stats: MentorStats;
  isVisible: boolean;
  onHide: () => void;
};

const MentorStatsModal = ({ stats, isVisible, onHide }: Props) => {
  const { courseName, students } = stats;

  return (
    <Modal title={`${courseName} statistics`} open={isVisible} onCancel={onHide} footer={null} width={'80%'}>
      <Flex gap={16} wrap="wrap" justify="center">
        {students?.map(({ name, githubId, totalScore, repoUrl }) => {
          const profile = `/profile?githubId=${githubId}`;
          const githubLink = `https://github.com/${githubId}`;

          return (
            <Card key={`mentor-stats-modal-student-${githubId}`} type="inner" size="small" style={{ width: '20rem' }}>
              <Card.Meta
                avatar={<GithubAvatar githubId={githubId} size={48} />}
                title={<a href={profile}>{name}</a>}
                description={
                  <Flex vertical gap={8}>
                    <ScoreWidget score={totalScore} />
                    <Space>
                      <GithubOutlined />
                      <a href={githubLink} target="_blank">
                        {githubId}
                      </a>
                    </Space>
                    <Space>
                      <LockFilled />
                      <a href={repoUrl} target="_blank">
                        {repoUrl?.split('/').pop()}
                      </a>
                    </Space>
                  </Flex>
                }
              />
            </Card>
          );
        })}
      </Flex>
    </Modal>
  );
};

export default MentorStatsModal;
