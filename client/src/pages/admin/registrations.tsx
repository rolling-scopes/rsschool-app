import { DislikeOutlined, HourglassOutlined, LikeOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select, Statistic, Table, Typography } from 'antd';
import axios from 'axios';
import { GithubUserLink } from 'components/GithubUserLink';
import { stringSorter } from 'components/Table';
import { useState } from 'react';
import { formatMonthFriendly } from 'services/formatter';
import { Course, CourseRole } from 'services/models';
import { AdminPageLayout } from 'components/PageLayout';
import { ActiveCourseProvider, SessionProvider, useActiveCourseContext } from 'modules/Course/contexts';

const defaultRowGutter = 24;
const PAGINATION = 200;
const DEFAULT_STATISTICS = { approved: 0, rejected: 0, pending: 0 };

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

function Page() {
  const { courses } = useActiveCourseContext();
  const [activeCourses] = useState((courses || []).filter((course: Course) => !course.completed && !course.inviteOnly));
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
        attributes: { maxStudentsLimit },
      } = registration;
      const {
        firstName,
        lastName,
        githubId,
        contactsEpamEmail,
        locationName: city,
      } = user || {
        firstName: '',
        lastName: '',
        githubId: '',
        contactsEpamEmail: '',
        locationName: '',
      };

      return {
        id,
        status,
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

  const [description] = activeCourses.filter(c => c.id === courseId).map(c => c.description);
  const rowSelection = { onChange: changeSelection };

  return (
    <AdminPageLayout title="Registrations" loading={loading} courses={courses}>
      <Col>
        <Row gutter={defaultRowGutter}>
          <Col>
            <Select style={{ width: 300 }} placeholder="Select a course..." onChange={handleCourseChange}>
              {activeCourses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name}{' '}
                  {`(${course.discipline?.name ? `${course.discipline.name}, ` : ''}${formatMonthFriendly(
                    course.startDate,
                  )})`}
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
            ]}
          />
        )}
      </Col>
    </AdminPageLayout>
  );
}

export default function () {
  return (
    <ActiveCourseProvider>
      <SessionProvider allowedRoles={[CourseRole.Manager, CourseRole.Supervisor]}>
        <Page />
      </SessionProvider>
    </ActiveCourseProvider>
  );
}
