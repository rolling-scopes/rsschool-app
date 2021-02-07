import * as React from 'react';
import { Layout, Table, Button, List, Typography, Row, Col, Badge, Card, Popconfirm } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { getColumnSearchProps } from 'components/Table';
import { Header, FooterLayout } from 'components';
import { NextRouter, withRouter } from 'next/router';
import withSession, { Session } from 'components/withSession';
import { UserService } from '../../services/user';
import { mockCVInfo } from './mockData';
import heroesBadges from '../../configs/heroes-badges';
import { DeleteOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Text } = Typography;
const { Item } = List;


type Props = {
  router: NextRouter;
  session: Session;
};

type State = {
  isLoading: boolean;
  users: any;
  adminMode: boolean;
};

class Page extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    users: null,
    adminMode: false
  };

  private userService = new UserService();

  private countBadges = (badges: any) => {
    const badgesCount: any = {};

    badges.forEach(({ badgeId }: { badgeId: any }) => {
      if (badgeId) {
        badgesCount[badgeId] ? (badgesCount[badgeId] += 1) : (badgesCount[badgeId] = 1);
      }
    });

    return badgesCount;
  };

  private columns = [
    {
      title: 'Name',
      dataIndex: 'complexData',
      key: 'complexData',
      render: (data: any) => {
        const { name, githubId } = data;
        const { adminMode } = this.state;

        return (
          <>
            <a href={`/cv?githubId=${githubId}`}>{name}</a>
            {adminMode && (
              <Popconfirm
                title='Are you sure you want to remove this user?'
                onConfirm={() => this.removeJobSeeker(githubId)}
                okText='Yes'
                cancelText='No'
              >
                <DeleteOutlined />
              </Popconfirm>
            )}
          </>
        );
      },
      ...getColumnSearchProps('name')
    },
    {
      title: 'Desired postion',
      dataIndex: 'desiredPosition',
      key: 'desiredPosition',
      ...getColumnSearchProps('desiredPosition')
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      ...getColumnSearchProps('location')
    },
    {
      title: 'English level',
      dataIndex: 'englishLevel',
      key: 'englishLevel',
      ...getColumnSearchProps('englishLevel')
    },
    {
      title: 'Full time',
      dataIndex: 'fullTime',
      key: 'fullTime',
      ...getColumnSearchProps('fullTime')
    },
    {
      title: 'Start from',
      dataIndex: 'startFrom',
      key: 'startFrom',
      ...getColumnSearchProps('startFrom')
    },
    {
      title: 'Courses',
      dataIndex: 'courses',
      key: 'courses',
      ...getColumnSearchProps('courses.courseFullName'),
      render: (courses: any) => {
        if (!courses) return 'No courses';
        return (
          <List
            dataSource={courses}
            renderItem={(record: any) => {
              const {
                courseFullName,
                courseName,
                locationName,
                isExpelled,
                certificateId,
                isCourseCompleted,
                totalScore,
                position,
              } = record;
              const title = `${courseFullName}${locationName ? locationName : ''}`;
              const certificateLink = certificateId ? `https://app.rs.school/certificate/${certificateId}` : '';
              const courseStats = `Score: ${totalScore}
              Position: ${position}`;
              let courseStatus;
              if (isExpelled) {
                courseStatus = <Text>Expelled</Text>;
              } else if (certificateId) {
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
                <Item style={{ fontSize: '14px' }}>
                  <details>
                    <summary>{courseName}</summary>
                    <Row justify="space-between" style={{ width: '100%' }}>
                      <Col span={12}>
                        <Text strong>{title}</Text>
                        <br />
                        <Text>Course status: </Text>
                        {courseStatus}
                      </Col>
                      <Col span={3} offset={9}>
                        <Text>{courseStats}</Text>
                      </Col>
                    </Row>
                  </details>
                </Item>
              );
            }}
          />);
      }
    },
    {
      title: 'Public feedback',
      dataIndex: 'publicFeedback',
      key: 'publicFeedback',
      render: (badges: any) => {
        if (!badges) return 'No public feedback yet'
        const badgesCount = this.countBadges(badges);
        return Object.keys(badgesCount).map(badgeId => (
          <div style={{ margin: 5, display: 'inline-block' }} key={`badge-${badgeId}`}>
            <Badge.Ribbon text={badgesCount[badgeId]}>
              <Card >{(heroesBadges as any)[badgeId].name}</Card>
            </Badge.Ribbon>
          </div>
        ));
      }
    }
  ];

  private async fetchData() {
    const data = await this.userService.getJobSeekers();
  }

  private async removeJobSeeker(githubId: string) {
    await this.setState({ isLoading: true });
    await this.userService.changeOpportunitiesConsent(githubId, false);
    await this.setState({ isLoading: false });
  }



  private async setAdminMode() {
    await this.setState({
      adminMode: true
    });
  }

  async componentDidMount() {
    const data = [mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo, mockCVInfo];
    await this.setState({ isLoading: true });
    await this.setState({ users: data })
    await this.setState({ isLoading: false });
  }

  render() {

    const { isLoading, users } = this.state;
    const userGithubId = this.props.session.githubId;

    let data;

    if (users) {
      data = users.map((item: any, index: any) => {
        const { cvName, fullTime, githubId, startFrom, englishLevel, desiredPosition, courses, publicFeedback, cvLocation: location } = item;
        return {
          key: index,
          complexData: { name: cvName, githubId },
          courses,
          publicFeedback,
          desiredPosition,
          fullTime: fullTime ? 'Yes' : 'No',
          location,
          startFrom,
          englishLevel: englishLevel.toUpperCase()
        }
      });
    } else {
      data = null;
    }

    return (
      <>
        <Header username={userGithubId} />
        <LoadingScreen show={isLoading}>
          <Layout style={{ margin: 'auto', backgroundColor: '#FFF' }}>
            <Content style={{ backgroundColor: '#FFF', minHeight: '500px', margin: 'auto' }}>
              <Button htmlType='button' onClick={this.setAdminMode.bind(this)}>Set admin mode</Button>
              <Button htmlType='button' onClick={this.fetchData.bind(this)}>Get profiles</Button>
              <Table style={{minWidth: '99vw'}} columns={this.columns} dataSource={data}></Table>
            </Content>
          </Layout>
        </LoadingScreen>
        <FooterLayout />
      </>
    );
  }
}

export default withRouter(withSession(Page));
