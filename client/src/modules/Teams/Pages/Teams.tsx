import { message, Modal, Row, Typography } from 'antd';
import { useMemo, useState, useContext } from 'react';
import { PageLayout } from 'components/PageLayout';
import {
  JoinTeamModal,
  MyTeamSection,
  StudentsWithoutTeamSection,
  TeamModal,
  TeamsHeader,
  TeamsSection,
} from '../components';
import { isActiveStudent, isCourseManager } from 'domain/user';
import { useCopyToClipboard } from 'react-use';
import { CreateTeamDto, TeamApi, TeamDto, JoinTeamDto, TeamDistributionApi } from 'api';
import { useLoading } from 'components/useLoading';
import { useDistribution } from '../hooks';
import { useMessage, useModalForm } from 'hooks';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { useRouter } from 'next/router';
import CheckCircleTwoTone from '@ant-design/icons/CheckCircleTwoTone';

const { Title, Text } = Typography;

const teamApi = new TeamApi();
const teamDistributionApi = new TeamDistributionApi();

function Teams() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();
  const router = useRouter();
  const { notification } = useMessage();
  const [modal, contextHolder] = Modal.useModal();

  const teamDistributionId = Number(router.query.teamDistributionId);

  const {
    distribution,
    loadDistribution,
    loading: loadingDistribution,
  } = useDistribution(course.id, teamDistributionId);

  const { open: openTeamModal, toggle: toggleTeamModal, mode, formData: teamData } = useModalForm<Partial<TeamDto>>();
  const [loading, withLoading] = useLoading(false);

  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);

  const [activeTab, setActiveTab] = useState('teams');

  const [, copyToClipboard] = useCopyToClipboard();

  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const isStudent = useMemo(() => isActiveStudent(session, course.id), [session, course.id]);
  const studentId = useMemo(() => session.courses[course.id]?.studentId, [session, course.id]);

  const handleCreateTeam = () => {
    toggleTeamModal();
  };

  const distributeStudentsToTeam = withLoading(async () => {
    try {
      await teamDistributionApi.distributeStudentsToTeam(course.id, teamDistributionId);
    } catch {
      message.error('Failed to distribute students to team. Please try later.');
    }
  });

  const handleDistributeStudents = async () => {
    await distributeStudentsToTeam();
    await loadDistribution();
  };

  const handleJoinTeam = () => {
    setShowJoinTeamModal(true);
  };

  const joinTeam = withLoading(async (teamId: number, record: JoinTeamDto) => {
    try {
      const { data: team } = await teamApi.joinTeam(course.id, teamDistributionId, teamId, record);
      await loadDistribution();
      setShowJoinTeamModal(false);
      modal.success({
        title: <Title level={5}>Successfully joined to the {team.name}</Title>,
        content: (
          <div>
            <Text type="secondary">{team.description}</Text>
          </div>
        ),
        okText: 'Next',
      });
    } catch {
      message.error('Failed to join to team. Please try later.');
    }
  });

  const copyPassword = async (teamId: number): Promise<void> => {
    const teamApi = new TeamApi();
    try {
      const { data } = await teamApi.getTeamPassword(course.id, teamDistributionId, teamId);
      copyToClipboard(data.password);
      notification.success({ message: 'Password copied to clipboard', duration: 2 });
    } catch {
      message.error('Something went wrong. Please try again later.');
    }
  };

  const changePassword = async (teamId: number): Promise<void> => {
    const teamApi = new TeamApi();
    try {
      const { data } = await teamApi.changeTeamPassword(course.id, teamDistributionId, teamId);
      copyToClipboard(data.password);
      notification.success({ message: 'New Password copied to clipboard', duration: 2 });
    } catch {
      message.error('Something went wrong. Please try again later.');
    }
  };

  const submitTeam = withLoading(async (record: CreateTeamDto, id?: number) => {
    try {
      if (id) {
        await teamApi.updateTeam(course.id, teamDistributionId, id, record);
      } else {
        const { data: team } = await teamApi.createTeam(course.id, teamDistributionId, record);
        modal.confirm({
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
      await loadDistribution();
      toggleTeamModal();
    } catch {
      message.error('Failed to create team. Please try later.');
    }
  });

  const contentRenderers = () => {
    if (!distribution) {
      return null;
    }
    switch (activeTab) {
      case 'teams':
        return <TeamsSection distribution={distribution} toggleTeamModal={toggleTeamModal} isManager={isManager} />;

      case 'students':
        return (
          <StudentsWithoutTeamSection
            distribution={distribution}
            isManager={isManager}
            reloadDistribution={loadDistribution}
          />
        );

      case 'myTeam':
        return (
          <MyTeamSection
            distribution={distribution}
            toggleTeamModal={toggleTeamModal}
            studentId={studentId}
            copyPassword={copyPassword}
            changePassword={changePassword}
            reloadDistribution={loadDistribution as () => Promise<void>}
            setActiveTab={setActiveTab}
          />
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout loading={loadingDistribution || loading} title="RS Teams" showCourseName withMargin={false}>
      {contextHolder}
      {openTeamModal && distribution && (
        <TeamModal
          mode={mode}
          isManager={isManager}
          data={teamData}
          onSubmit={submitTeam}
          onCancel={toggleTeamModal}
          maxStudentsCount={distribution.strictTeamSize}
          courseId={distribution.courseId}
        />
      )}
      {showJoinTeamModal && <JoinTeamModal onSubmit={joinTeam} onCancel={() => setShowJoinTeamModal(false)} />}
      {distribution ? (
        <TeamsHeader
          courseAlias={course.alias}
          isManager={isManager}
          isStudent={isStudent}
          activeTab={activeTab}
          distribution={distribution}
          setActiveTab={setActiveTab}
          handleCreateTeam={handleCreateTeam}
          handleDistributeStudents={handleDistributeStudents}
          handleJoinTeam={handleJoinTeam}
        />
      ) : null}
      <Row style={{ padding: '24px', margin: 24 }}>{contentRenderers()}</Row>
    </PageLayout>
  );
}

export default Teams;
