import React, { useState, useCallback, useEffect } from 'react';
import { Layout, Table, List, Typography, Row, Col, Badge, Avatar, Popconfirm, Result, Tooltip, Switch } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { getColumnSearchProps } from 'components/Table';
import { JobSeekerData, JobSeekerStudentStats, JobSeekerFeedback } from '../../../../common/models/cv';
import { Header } from 'components';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { OpportunitiesService } from '../../modules/Opportunities/services/opportunities';
import heroesBadges from '../../configs/heroes-badges';
import { EyeInvisibleOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { SwitchChangeEventHandler } from 'antd/lib/switch';

const { Content } = Layout;
const { Text } = Typography;
const { Item } = List;

type Props = {
  router: NextRouter;
  session: Session;
};

type OmitByVisibility = (obj: { isHidden: boolean }) => boolean;

function Page(props: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [jobSeekers, setJobSeekers] = useState<JobSeekerData[] | null>(null);
  const [areHiddenJobSeekersShown, setHiddenJobSeekersShown] = useState<boolean>(false);

  const { isAdmin, isHirer, githubId: userGithubId } = props.session;

  const hasPriorityRole = isAdmin || isHirer;

  const cvService = new OpportunitiesService();

  const countBadges = (badges: JobSeekerFeedback[]) => {
    const badgesCount: {
      [index: string]: number;
    } = {};

    badges.forEach(({ badgeId }) => {
      if (badgeId) {
        badgesCount[badgeId] ? (badgesCount[badgeId] += 1) : (badgesCount[badgeId] = 1);
      }
    });

    return badgesCount;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'complexData',
      key: 'complexData',
      render: (data: { name: string; githubId: string; isHidden: boolean }) => {
        const { name, githubId, isHidden } = data;

        return (
          <>
            <a href={`/cv/${githubId}`}>{name ?? 'Unknown'}</a>
            {isAdmin && (
              <>
                {isHidden ? (
                  <Popconfirm
                    title="This CV is currently hidden. Make it visible?"
                    onConfirm={() => changeHiddenStatus(githubId, false)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <EyeOutlined />
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="This CV is currently visible. Make it hidden?"
                    onConfirm={() => changeHiddenStatus(githubId, true)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <EyeInvisibleOutlined />
                  </Popconfirm>
                )}
                <Popconfirm
                  title="Are you sure you want to delete this user's CV?"
                  onConfirm={() => deleteJobSeeker(githubId)}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined />
                </Popconfirm>
              </>
            )}
          </>
        );
      },
      ...getColumnSearchProps('name'),
    },
    {
      title: 'CV expires',
      dataIndex: 'expires',
      key: 'expires',
      render: (expirationTimestamp: number) => {
        const expirationDate = new Date(expirationTimestamp);
        const addZeroPadding = (num: number) => `0${num}`.slice(-2);
        const [year, month, date] = [
          expirationDate.getFullYear(),
          expirationDate.getMonth() + 1,
          expirationDate.getDate(),
        ];
        const expirationDateFormatted = `${year}-${addZeroPadding(month)}-${addZeroPadding(date)}`;
        return <Text>{expirationDateFormatted}</Text>;
      },
      ...getColumnSearchProps('expires'),
    },
    {
      title: 'Desired postion',
      dataIndex: 'desiredPosition',
      key: 'desiredPosition',
      ...getColumnSearchProps('desiredPosition'),
    },
    {
      title: 'Locations',
      dataIndex: 'locations',
      key: 'locations',
      ...getColumnSearchProps('locations'),
      render: (locationsRaw: string) => {
        const locations = locationsRaw.split('\n');
        const locationsItems = locations.map(location => <li key={location}>{location}</li>);
        return <ol>{locationsItems}</ol>;
      },
    },
    {
      title: 'English level',
      dataIndex: 'englishLevel',
      key: 'englishLevel',
      ...getColumnSearchProps('englishLevel'),
    },
    {
      title: 'Full time',
      dataIndex: 'fullTime',
      key: 'fullTime',
      ...getColumnSearchProps('fullTime'),
    },
    {
      title: 'Start from',
      dataIndex: 'startFrom',
      key: 'startFrom',
      ...getColumnSearchProps('startFrom'),
    },
    {
      title: 'Courses',
      dataIndex: 'courses',
      key: 'courses',
      ...getColumnSearchProps('courses.courseFullName'),
      render: (courses: JobSeekerStudentStats[]) => {
        if (!courses) return 'No courses';
        return (
          <List
            dataSource={courses}
            renderItem={(record: JobSeekerStudentStats) => {
              const {
                courseFullName,
                courseName,
                locationName,
                certificateId,
                isCourseCompleted,
                totalScore,
                rank,
                mentor: { name: mentorName, githubId: mentorGithubId },
              } = record;
              const title = `${courseFullName}${locationName ? locationName : ''}`;
              const certificateLink = certificateId ? `https://app.rs.school/certificate/${certificateId}` : '';
              const courseStats = (
                <>
                  <Text style={{ whiteSpace: 'nowrap' }}>Score: {totalScore}</Text>
                  <br />
                  <Text style={{ whiteSpace: 'nowrap' }}>Position: {rank}</Text>
                </>
              );
              let courseStatus;

              if (certificateId) {
                courseStatus = (
                  <>
                    <Text>Completed with </Text>
                    <a href={certificateLink}>certificate</a>
                  </>
                );
              } else if (isCourseCompleted) {
                courseStatus = <Text>Completed</Text>;
              } else {
                courseStatus = <Text>In progress</Text>;
              }

              return (
                <Item>
                  <details style={{ fontSize: '12px' }}>
                    <summary style={{ fontSize: '14px' }}>{courseName}</summary>
                    <Row justify="space-between" style={{ width: '410px' }}>
                      <Col span={10}>
                        <Text strong>{title}</Text>
                        <br />
                        <Text>Course status: </Text>
                        {courseStatus}
                      </Col>
                      <Col span={3}>
                        <Text style={{ whiteSpace: 'nowrap' }}>Mentor:</Text>
                        <br />
                        {mentorName ? (
                          <a className="black-on-print" href={`https://github.com/${mentorGithubId}`}>
                            {mentorName}
                          </a>
                        ) : (
                          <Text>No mentor</Text>
                        )}
                      </Col>
                      <Col span={5}>{courseStats}</Col>
                    </Row>
                  </details>
                </Item>
              );
            }}
          />
        );
      },
    },
    {
      title: 'Public feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      render: (badges: JobSeekerFeedback[]) => {
        if (!badges.length) return 'No public feedback yet';
        const badgesCount = countBadges(badges);
        return Object.keys(badgesCount).map(badgeId => {
          const heroesBadge = (heroesBadges as any)[badgeId];
          return (
            <div style={{ margin: 5, display: 'inline-block' }} key={`badge-${badgeId}`}>
              <Tooltip title={`${heroesBadge.name} badge`}>
                <Badge count={badgesCount[badgeId]}>
                  <Avatar src={`/static/svg/badges/${heroesBadge.url}`} alt={`${heroesBadge.name} badge`} size={50} />
                </Badge>
              </Tooltip>
            </div>
          );
        });
      },
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data: JobSeekerData[] = await cvService.getApplicants();
    setJobSeekers(data);
    setLoading(false);
  }, []);

  const deleteJobSeeker = async (githubId: string) => {
    setLoading(true);
    await cvService.updateConsent(githubId, false);
    await fetchData();
    setLoading(false);
  };

  const changeHiddenStatus = async (githubId: string, hiddenStatus: boolean) => {
    setLoading(true);
    await cvService.changeResumeVisibility(githubId, hiddenStatus);
    await fetchData();
    setLoading(false);
  };

  const handleVisibilitySwitch: SwitchChangeEventHandler = checked => {
    setHiddenJobSeekersShown(checked);
  };

  const transformJobSeekersData = (data: JobSeekerData[]) => {
    return data.map((item, index) => {
      const {
        name,
        fullTime,
        githubId,
        startFrom,
        englishLevel,
        desiredPosition,
        courses,
        feedback,
        locations,
        expires,
        isHidden,
      } = item;
      return {
        key: index,
        complexData: { name: name?.length ? name : '<Not set>', githubId, isHidden },
        expires: Number(expires),
        courses,
        feedback,
        desiredPosition: desiredPosition?.length ? desiredPosition : '<Not set>',
        fullTime: fullTime ? 'Yes' : 'No',
        locations: locations?.length ? locations : '<Not set>',
        startFrom: startFrom?.length ? startFrom : '<Not set>',
        englishLevel: englishLevel?.length ? englishLevel?.toUpperCase() : '<Not set>',
        isHidden,
      };
    });
  };

  useEffect(() => {
    if (hasPriorityRole) fetchData();
  }, []);

  if (!hasPriorityRole)
    return (
      <>
        <Header username={userGithubId} />
        <Result status="403" title="Sorry, but you don't have access to this page" />
      </>
    );

  let data = null;

  if (jobSeekers) {
    const omitHidden: OmitByVisibility = ({ isHidden }) => !isHidden;
    const omitVisible: OmitByVisibility = ({ isHidden }) => isHidden;
    const filteredJobSeekers = jobSeekers.filter(areHiddenJobSeekersShown ? omitVisible : omitHidden);
    data = transformJobSeekersData(filteredJobSeekers);
  }

  return (
    <>
      <Header username={userGithubId} />
      <LoadingScreen show={loading}>
        <Layout style={{ margin: 'auto', backgroundColor: '#FFF' }}>
          <Content style={{ backgroundColor: '#FFF', minHeight: '60vh', margin: 'auto' }}>
            {isAdmin && (
              <Switch
                checked={areHiddenJobSeekersShown}
                onChange={handleVisibilitySwitch}
                checkedChildren="Hidden"
                unCheckedChildren="Visible"
              />
            )}
            <Table style={{ minWidth: '99vw' }} columns={columns} dataSource={data ?? undefined}></Table>
          </Content>
        </Layout>
      </LoadingScreen>
    </>
  );
}

export default withRouter(withSession(Page));
