import { Button, Card, Col, Row, Space, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { TeamDistributionDetailedDto } from 'api';
import { tabRenderer } from 'components/TabsWithCounter/renderers';
import { useMedia } from 'react-use';
import { Dispatch, SetStateAction, useMemo } from 'react';

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
  const mobileView = useMedia('(max-width: 720px)');

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
    <Row style={{ background: 'white', marginTop: -15, padding: '24px 24px 0' }}>
      <Col>
        <Row justify="start" align="middle">
          <Space size={24}>
            <Link href={`team-distributions?course=${courseAlias}`}>
              <ArrowLeftOutlined />
            </Link>
            <Title level={4} style={{ marginBottom: 0 }}>
              Teams
            </Title>
            <Text type="secondary">Distribution of participants per team</Text>
            {isStudent && (
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
            )}
          </Space>
        </Row>
        <Title level={5} style={{ marginLeft: 27 }}>
          The roles of team members are determined automatically.
        </Title>

        {!isManager && isStudent && !distribution.myTeam && (
          <Space size={24} direction={mobileView ? 'vertical' : 'horizontal'}>
            {!distribution.myTeam && (
              <Card
                title={<Title level={5}>Are you going to be a leader completing a group task?</Title>}
                style={{ backgroundColor: '#E6F7FF' }}
              >
                <Space size={12} direction="vertical">
                  <Text type="secondary">
                    Create the team, compose a description and provide a link to a team chat. You’ll get an invitation
                    password to share with your team members. Being a leader is honorable and responsible
                  </Text>
                  <Button onClick={handleCreateTeam}>Create team</Button>
                </Space>
              </Card>
            )}
            {isStudent && !distribution.myTeam && (
              <Card
                title={<Title level={5}>Have you found a great team to join?</Title>}
                style={{ backgroundColor: '#E6F7FF' }}
              >
                <Space size={12} direction="vertical">
                  <Text type="secondary">
                    View the list of available teams, find an exciting description. Done this? Ask a team lead to share
                    an invitation password to become a member of the greatest team
                  </Text>
                  <Button onClick={handleJoinTeam}>Join team</Button>
                </Space>
              </Card>
            )}
          </Space>
        )}
        {isManager && (
          <Row gutter={24}>
            <Col>
              <Button type="primary" onClick={handleCreateTeam}>
                Create team
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={handleDistributeStudents}>
                Distribute students
              </Button>
            </Col>
          </Row>
        )}
        <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={setActiveTab} />
      </Col>
    </Row>
  );
}
