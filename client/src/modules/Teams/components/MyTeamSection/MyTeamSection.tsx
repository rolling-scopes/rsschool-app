import { Button, notification, Row, Space, Typography } from 'antd';
import { EditTwoTone, CopyOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { TeamApi, TeamDistributionDetailedDto, TeamDto } from 'api';
import StudentsTable from '../StudentsTable/StudentsTable';
import { useCopyToClipboard } from 'react-use';

const { Text, Title } = Typography;

type Props = {
  distribution: TeamDistributionDetailedDto;
  toggleTeamModal: (data?: Partial<TeamDto> | undefined) => void;
  studentId?: number;
  copyPassword: (teamId: number) => Promise<void>;
  reloadDistribution: () => Promise<void>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
};

const teamApi = new TeamApi();

export default function MyTeamSection({
  distribution,
  toggleTeamModal,
  studentId,
  copyPassword,
  reloadDistribution,
  setActiveTab,
}: Props) {
  const myTeam = distribution.myTeam;

  const isTeamLead = useMemo(() => studentId === myTeam?.teamLeadId, [studentId, myTeam?.teamLeadId]);
  const [, copyToClipboard] = useCopyToClipboard();

  const copyChatLink = () => {
    copyToClipboard(myTeam?.chatLink);
    notification.success({ message: 'Chat link copied to clipboard', duration: 2 });
  };

  const leaveTeam = async () => {
    await teamApi.leaveTeam(distribution.courseId, distribution.id, myTeam?.id);
    setActiveTab('teams');
    await reloadDistribution();
  };

  return distribution.myTeam ? (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <Title level={5}>{myTeam.name}</Title>
      <Space size={12}>
        <Text type="secondary">{myTeam.description}</Text>
        {isTeamLead && <EditTwoTone twoToneColor="#1890FF" onClick={() => toggleTeamModal(myTeam)} />}
      </Space>
      <Row justify="end">
        <Space size="small">
          {isTeamLead && (
            <>
              <Button onClick={() => copyPassword(myTeam.id)} icon={<CopyOutlined />}>
                Invitation password
              </Button>
              <Button onClick={() => copyChatLink()} icon={<CopyOutlined />} disabled={!myTeam.chatLink}>
                Chat link
              </Button>
            </>
          )}
          <Button type="link" onClick={leaveTeam}>
            Leave Team
          </Button>
        </Space>
      </Row>
      <StudentsTable content={myTeam.students} pagination={false} teamLeadId={myTeam.teamLeadId} />
    </Space>
  ) : null;
}
