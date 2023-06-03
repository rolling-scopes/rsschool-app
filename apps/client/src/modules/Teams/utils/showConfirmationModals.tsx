import { Modal, Typography } from 'antd';
import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';
import { TeamInfoDto, TeamDto } from 'api';

const { Title, Text } = Typography;

export function showCreateTeamResultModal(team: TeamDto, copyPassword: (teamId: number) => Promise<void>) {
  Modal.confirm({
    title: <Title level={5}>{team.name} is created successfully</Title>,
    content: (
      <div>
        <Title level={5}>As a team lead you get an invitation password to join members</Title>
        <Text type="secondary">{team.description}</Text>
      </div>
    ),
    cancelText: 'Next',
    cancelButtonProps: { type: 'primary' },
    onOk: () => copyPassword(team.id),
    okText: 'Copy invitation password',
    okButtonProps: { type: 'default' },
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
  });
}

export function showJoinTeamResultModal(team: TeamInfoDto) {
  Modal.success({
    title: <Title level={5}>Successfully joined to the {team.name}</Title>,
    content: (
      <div>
        <Text type="secondary">{team.description}</Text>
      </div>
    ),
    okText: 'Next',
  });
}
