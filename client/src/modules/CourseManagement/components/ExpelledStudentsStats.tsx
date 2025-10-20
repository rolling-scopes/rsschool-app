import { useRequest } from 'ahooks';
import { Table, Typography, Tag, Button } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
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
          <Text strong style={{ marginLeft: 15 }}>{record.course.alias}</Text>
          <br />
          <Text type="secondary">{record.course.fullName || record.course.name}</Text>
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

  const handleExportCsv = () => {
    if (!data || data.length === 0) {
      return;
    }

    const exportableColumns = columns.filter(
      (col): col is ColumnType<DetailedExpelledStat> => 'dataIndex' in col && col.dataIndex !== undefined
    );

    const headers = exportableColumns.map(col => {
      if (Array.isArray(col.title)) {
        return col.title.join(' ');
      }
      return col.title;
    }).filter(Boolean).join(',');

    const csvRows = data.map(row => {
      return exportableColumns.map(col => {
        let value = '';
        const dataIndex = col.dataIndex;

                if (Array.isArray(dataIndex)) {
                  let current: unknown = row;

                  for (const k of dataIndex) {

                    const keyAsString = String(k);

                    current = current ? (current as Record<string, unknown>)[keyAsString] : undefined;

                  }

                  value = current !== undefined && current !== null ? String(current) : '';

                }

         else if (typeof dataIndex === 'string' || typeof dataIndex === 'number') {
          value = row[dataIndex as keyof DetailedExpelledStat] !== undefined && row[dataIndex as keyof DetailedExpelledStat] !== null ? String(row[dataIndex as keyof DetailedExpelledStat]) : '';
        } else if (col.key === 'reasons') {
          value = row.reasonForLeaving ? row.reasonForLeaving.map(r => r.replace(/_/g, ' ')).join('; ') : '';
        } else if (col.key === 'date') {
          value = row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '';
        } else if (col.key === 'courseName') {
          value = row.course ? row.course.alias : '';
        } else if (col.key === 'githubId') {
          value = row.user ? row.user.githubId : '';
        }
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'expelled_students_stats.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Detailed Statistics on Student Departures</Title>
        <Button type="primary" onClick={handleExportCsv}>Export CSV</Button>
      </div>
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
