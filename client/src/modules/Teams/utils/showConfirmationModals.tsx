import { message, Modal, notification, Typography } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { TeamApi, TeamDto } from 'api';

const { Title, Text } = Typography;

export function showCreateTeamResultModal(team: TeamDto, courseId: number, copyToClipboard: (value: string) => void) {
  const copyPassword = async (): Promise<void> => {
    const teamApi = new TeamApi();
    try {
      const { data } = await teamApi.getTeamPassword(courseId, team.teamDistributionId, team.id);
      copyToClipboard(data.password);
      notification.success({ message: 'Password copied to clipboard', duration: 2 });
    } catch (error) {
      message.error('Something went wrong. Please try again later.');
    }
  };

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
    onOk: () => copyPassword(),
    okText: 'Copy invitation password',
    okButtonProps: { type: 'default' },
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
  });
}

export function showJoinTeamResultModal(team: TeamDto) {
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
