import { DislikeOutlined, HourglassOutlined, LikeOutlined } from '@ant-design/icons';
import { Button, Col, Layout, Row, Select, Spin, Statistic, Table, Typography } from 'antd';
import axios from 'axios';
import { AdminSider, GithubUserLink, Header } from 'components';
import { stringSorter } from 'components/Table';
import withCourses from 'components/withCourses';
import withSession, { Session } from 'components/withSession';
import { useState } from 'react';
import { formatMonthFriendly } from 'services/formatter';
import { Course } from 'services/models';

const { Content } = Layout;
const defaultRowGutter = 24;
const PAGINATION = 200;
const DEFAULT_STATISTICS = { approved: 0, rejected: 0, pending: 0 };

type Props = {
  courses: Course[];
  session: Session;
};

type Stats = {
  approved: number;
  rejected: number;
  pending: number;
};

interface Registration {
  id: number;
  status: string;
  lastName: string;
  user: {
    name: string;
    profileUrl: string;
  };
  githubId: string;
}

function Page(props: Props) {
  const [courses] = useState((props.courses || []).filter((course: Course) => !course.completed && !course.inviteOnly));
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATISTICS as Stats);
  const [courseId, setCourseId] = useState(null as number | null);

  const changeSelection = (_: any, selectedRows: any) => {
    setSelectedIds(selectedRows.map((row: any) => row.id));
  };

  const handleCourseChange = async (id: number | string) => {
    const courseId = Number(id);
    setCourseId(courseId);

    const url = `/api/registry?type=mentor&courseId=${courseId}`;
    const {
      data: { data: registrations },
    } = await axios.get(url);
    const statistics = { ...DEFAULT_STATISTICS };

    for (const registration of registrations) {
      switch (registration.status) {
        case 'approved':
          statistics.approved += 1;
          break;
        case 'rejected':
          statistics.rejected += 1;
          break;
        case 'pending':
          statistics.pending += 1;
          break;
      }
    }
    setLoading(false);
    const data = registrations.map((registration: any) => {
      const {
        user,
        id,
        status,
        comment,
        attributes: { maxStudentsLimit },
      } = registration;
      const { firstName, lastName, githubId, contactsEpamEmail, locationName: city } = user || {
        firstName: '',
        lastName: '',
        githubId: '',
        contactsEpamEmail: '',
        locationName: '',
      };

      return {
        id,
        status,
        comment,
        githubId,
        maxStudentsLimit,
        user: { name: `${firstName} ${lastName}`, profileUrl: `/profile?githubId=${githubId}` },
        isFromEpam: !!contactsEpamEmail,
        city,
      };
    });
    setData(data);
    setSelectedIds([]);
    setStats(statistics);
  };

  const handleSubmit = async (_: any, status: string) => {
    if (selectedIds.length) {
      try {
        setLoading(true);
        await axios.put('/api/registry', { ids: selectedIds, status });
        await handleCourseChange(courseId as number);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApprove = (e: any) => handleSubmit(e, 'approved');

  const handleReject = async (e: any) => handleSubmit(e, 'rejected');

  const [description] = courses.filter(c => c.id === courseId).map(c => c.description);
  const rowSelection = { onChange: changeSelection };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider isAdmin={props.session.isAdmin} />
      <Layout style={{ background: '#fff' }}>
        <Header title="Registrations" username={props.session.githubId} />
        <Content style={{ margin: 8 }}>
          <Spin spinning={loading}>
            <Col>
              <Row gutter={defaultRowGutter}>
                <Col>
                  <Select style={{ width: 300 }} placeholder="Select a course..." onChange={handleCourseChange}>
                    {courses.map(course => (
                      <Select.Option key={course.id} value={course.id}>
                        {course.name} ({course.primarySkillName}, {formatMonthFriendly(course.startDate)})
                      </Select.Option>
                    ))}
                  </Select>
                  <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
                </Col>
              </Row>
              {courseId && (
                <Row gutter={defaultRowGutter}>
                  <Col span={12}>
                    <Button type="primary" onClick={handleApprove}>
                      Approve
                    </Button>
                    <span>&nbsp;</span>
                    <Button danger onClick={handleReject}>
                      Reject
                    </Button>
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="Approved"
                      value={stats.approved}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<LikeOutlined />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic
                      title="Rejected"
                      value={stats.rejected}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<DislikeOutlined />}
                    />
                  </Col>
                  <Col span={4}>
                    <Statistic title="Pending" value={stats.pending} prefix={<HourglassOutlined />} />
                  </Col>
                </Row>
              )}
              {courseId && (
                <Table<Registration>
                  bordered
                  pagination={{ pageSize: PAGINATION }}
                  size="small"
                  rowKey="id"
                  dataSource={data}
                  rowSelection={rowSelection}
                  columns={[
                    {
                      title: 'Name',
                      dataIndex: 'lastName',
                      key: 'lastName',
                      width: 150,
                      sorter: stringSorter('lastName'),
                      render: (_: any, record: Registration) => <a href={record.user.profileUrl}>{record.user.name}</a>,
                    },
                    {
                      title: 'Github',
                      dataIndex: 'githubId',
                      key: 'githubId',
                      width: 100,
                      sorter: stringSorter('githubId'),
                      render: (value: string) => <GithubUserLink value={value} />,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      sorter: stringSorter('status'),
                      width: 50,
                    },
                    {
                      title: 'City',
                      dataIndex: 'city',
                      key: 'city',
                      width: 50,
                    },
                    {
                      title: 'Max students amount',
                      dataIndex: 'maxStudentsLimit',
                      key: 'maxStudentsLimit',
                      width: 100,
                    },
                    {
                      title: 'From EPAM',
                      dataIndex: 'isFromEpam',
                      key: 'isFromEpam',
                      width: 30,
                      render: (value: boolean) => (value ? 'Y' : 'N'),
                    },
                    { title: 'Comment', dataIndex: 'comment', key: 'comment', width: 100 },
                  ]}
                />
              )}
            </Col>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
}

export default withCourses(withSession(Page));
