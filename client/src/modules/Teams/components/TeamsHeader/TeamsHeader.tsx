import { Col, Row, Space, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { TeamDistributionDetailedDto } from 'api';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { ActionCard } from './ActionCard';

const { Title, Text } = Typography;

type Props = {
  courseAlias: string;
  isStudent: boolean;
  isManager: boolean;
  distribution: TeamDistributionDetailedDto;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  handleCreateTeam: () => void;
  handleDistributeStudents: () => void;
  handleJoinTeam: () => void;
};

export default function TeamsHeader({
  courseAlias,
  isStudent,
  distribution,
  isManager,
  activeTab,
  handleCreateTeam,
  handleDistributeStudents,
  handleJoinTeam,
  setActiveTab,
}: Props) {
  const tabs = useMemo(() => {
    const tabs = [
      { key: 'teams', label: 'Available teams', count: distribution.teamsCount },
      { key: 'students', label: 'Students without team', count: distribution.studentsWithoutTeamCount },
    ];
    if (distribution.myTeam) {
      tabs.push({ key: 'myTeam', label: 'My team', count: 0 });
    }
    return tabs.map(el => tabRenderer(el, activeTab));
  }, [activeTab, distribution]);

  return (
    <Row style={{ background: 'white', padding: '24px 24px 0' }}>
      <Col span={24}>
        <Row justify="start" align="middle" gutter={24}>
          <Col>
            <Space size="small">
              {' '}
              <Link href={`team-distributions?course=${courseAlias}`}>
                <ArrowLeftOutlined />
              </Link>
              <Title level={4} style={{ marginBottom: 0 }}>
                Teams
              </Title>
            </Space>
          </Col>
          <Col>
            <Text type="secondary">Distribution of participants per team</Text>
          </Col>
          {isStudent && (
            <Col>
              <Space size={12}>
                <Text type="secondary">My status:</Text>
                {distribution.myTeam ? (
                  <Tag icon={<ClockCircleOutlined />} color="green">
                    distributed
                  </Tag>
                ) : (
                  <Tag icon={<ClockCircleOutlined />}>without team</Tag>
                )}
              </Space>
            </Col>
          )}
        </Row>
        <Title level={5} style={{ marginLeft: 27 }}>
          The roles of team members are determined automatically.
        </Title>

        {!isManager && isStudent && !distribution.myTeam && (
          <Row gutter={[24, 12]}>
            {!distribution.myTeam && (
              <ActionCard
                title="Are you going to be a leader completing a group task?"
                text="Create the team, compose a description and provide a link to a team chat. You’ll get an invitation
                      password to share with your team members. Being a leader is honorable and responsible"
                buttonCaption="Create team"
                onClick={handleCreateTeam}
              />
            )}
            {isStudent && !distribution.myTeam && (
              <ActionCard
                title="Have you found a great team to join?"
                text="View the list of available teams, find an exciting description. Done this? Ask a team lead to
                      share an invitation password to become a member of the greatest team"
                buttonCaption="Join team"
                onClick={handleJoinTeam}
              />
            )}
          </Row>
        )}
        {isManager && (
          <Row gutter={[24, 12]}>
            <ActionCard
              title="Team management"
              text="You can manage unformed teams, combine small of them or create specific team manually"
              buttonCaption="Create team"
              onClick={handleCreateTeam}
            />
            <ActionCard
              title="Student distribution"
              text="All registered students will be grouped into teams according to the distribution settings specified"
              buttonCaption="Distribute students"
              onClick={handleDistributeStudents}
            />
          </Row>
        )}
        <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
      </Col>
    </Row>
  );
}
