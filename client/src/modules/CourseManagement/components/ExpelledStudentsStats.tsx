import { useRequest } from 'ahooks';
import { Table, Typography, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';
import { PublicSvgIcon } from '@client/components/Icons';
import { DEFAULT_COURSE_ICONS } from '@client/configs/course-icons';
import { dateUtcRenderer } from '@client/components/Table';

const { Title, Text } = Typography;

interface DetailedExpelledStat {
  id: string;
  course: {
    id: string;
    name: string;
    fullName: string;
    alias: string;
    description: string;
    logo: string;
  };
  user: {
    id: string;
    githubId: string;
  };
  reasonForLeaving: string[];
  otherComments: string;
  submittedAt: string;
}

const fetchExpelledStats = async (): Promise<DetailedExpelledStat[]> => {
  const response = await fetch('/api/course/stats/expelled');
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json() as Promise<DetailedExpelledStat[]>;
};

const ExpelledStudentsStats: React.FC = () => {
  const { data, error, loading } = useRequest(fetchExpelledStats);

  const columns: ColumnsType<DetailedExpelledStat> = [
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'courseName',
      render: (_text, record) => (
        <div>
          <PublicSvgIcon size="25px" src={DEFAULT_COURSE_ICONS[record.course.logo]?.active} />
          <Text strong style={{ marginLeft: 8 }}>{record.course.fullName || record.course.name}</Text>
          <br />
          <Text type="secondary">{record.course.alias}</Text>
        </div>
      ),
    },
    {
      title: 'Student GitHub',
      dataIndex: ['user', 'githubId'],
      key: 'githubId',
      render: (githubId) => <a href={`https://github.com/${githubId}`} target="_blank" rel="noopener noreferrer">{githubId}</a>,
    },
    {
      title: 'Reasons for Leaving',
      dataIndex: 'reasonForLeaving',
      key: 'reasons',
      render: (reasons: string[]) => {
        if (!reasons) {
          return null;
        }
        return (
          <>
            {reasons.map(reason => (
              <Tag key={reason}>{reason.replace(/_/g, ' ')}</Tag>
            ))}
          </>
        );
      },
    },
    {
      title: 'Other Comments',
      dataIndex: 'otherComments',
      key: 'otherComments',
    },
    {
      title: 'Date',
      dataIndex: 'submittedAt',
      key: 'date',
      render: dateUtcRenderer,
    },
  ];

  if (error) {
    return <p>Failed to load statistics.</p>;
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title level={4}>Detailed Statistics on Student Departures</Title>
      <Table
        loading={loading}
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="small"
      />
    </div>
  );
};

export default ExpelledStudentsStats;
