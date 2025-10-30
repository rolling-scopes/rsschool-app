import { Table, Typography, Tag, Button, Row } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import React from 'react';
import { PublicSvgIcon } from '@client/components/Icons';
import { DEFAULT_COURSE_ICONS } from '@client/configs/course-icons';
import { dateUtcRenderer } from '@client/components/Table';
import { useExpelledStats, DetailedExpelledStat } from '@client/modules/CourseManagement/hooks/useExpelledStats';

const { Title, Text } = Typography;

const ExpelledStudentsStats: React.FC = () => {
  const { data, error, loading, isDeleting, handleDelete } = useExpelledStats();

  const columns: ColumnsType<DetailedExpelledStat> = [
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'courseName',
      render: (_text, record) => (
        <div>
          <PublicSvgIcon size="25px" src={DEFAULT_COURSE_ICONS[record.course.logo]?.active} />
          <Text strong style={{ marginLeft: 15 }}>
            {record.course.alias}
          </Text>
          <br />
          <Text type="secondary">{record.course.fullName || record.course.name}</Text>
        </div>
      ),
    },
    {
      title: 'Student GitHub',
      dataIndex: ['user', 'githubId'],
      key: 'githubId',
      render: githubId => (
        <a href={`https://github.com/${githubId}`} target="_blank" rel="noopener noreferrer">
          {githubId}
        </a>
      ),
    },
    {
      title: 'Reasons for Leaving',
      dataIndex: 'reasonForLeaving',
      key: 'reasons',
      render: (reasons?: string[]) => (
        <>{reasons?.map(reason => <Tag key={reason}>{reason.replace(/_/g, ' ')}</Tag>)}</>
      ),
    },
    {
      title: 'Other Comments',
      dataIndex: 'otherComment',
      key: 'otherComment',
    },
    {
      title: 'Date',
      dataIndex: 'submittedAt',
      key: 'date',
      render: dateUtcRenderer,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_text, record) => (
        <Button danger onClick={() => handleDelete(record.id)} loading={isDeleting}>
          Delete
        </Button>
      ),
    },
  ];

  if (error) {
    return <Typography.Paragraph>Failed to load statistics.</Typography.Paragraph>;
  }

  const [csvUrl, setCsvUrl] = React.useState<string | null>(null);
  const downloadRef = React.useRef<HTMLAnchorElement>(null);

  const escapeCSVValue = (value: string): string => {
    if (value.includes(',') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const getValueFromDataIndex = (row: DetailedExpelledStat, dataIndex: unknown): string => {
    if (Array.isArray(dataIndex)) {
      let current: unknown = row;

      for (const key of dataIndex) {
        const keyAsString = String(key);
        current = current ? (current as Record<string, unknown>)[keyAsString] : undefined;
      }

      return current !== undefined && current !== null ? String(current) : '';
    }

    if (typeof dataIndex === 'string' || typeof dataIndex === 'number') {
      const value = row[dataIndex as keyof DetailedExpelledStat];
      return value !== undefined && value !== null ? String(value) : '';
    }

    return '';
  };

  const getSpecialColumnValue = (row: DetailedExpelledStat, columnKey: string): string => {
    switch (columnKey) {
      case 'reasons':
        return row.reasonForLeaving ? row.reasonForLeaving.map(r => r.replace(/_/g, ' ')).join('; ') : '';
      case 'date':
        return row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '';
      case 'courseName':
        return row.course ? row.course.alias : '';
      case 'githubId':
        return row.user ? row.user.githubId : '';
      default:
        return '';
    }
  };

  const formatRowToCsv = (row: DetailedExpelledStat, exportableColumns: ColumnType<DetailedExpelledStat>[]): string => {
    return exportableColumns
      .map(col => {
        let value = '';

        if (col.dataIndex) {
          value = getValueFromDataIndex(row, col.dataIndex);
        } else if (col.key) {
          value = getSpecialColumnValue(row, String(col.key));
        }

        return escapeCSVValue(value);
      })
      .join(',');
  };

  const handleExportCsv = () => {
    if (!data || data.length === 0) {
      return;
    }

    const exportableColumns = columns.filter(
      (col): col is ColumnType<DetailedExpelledStat> => 'dataIndex' in col && col.dataIndex !== undefined,
    );

    const headers = exportableColumns
      .map(col => {
        if (Array.isArray(col.title)) {
          return col.title.join(' ');
        }
        return col.title;
      })
      .filter(Boolean)
      .join(',');

    const csvRows = data.map(row => formatRowToCsv(row, exportableColumns));

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    setCsvUrl(url);

    setTimeout(() => {
      if (downloadRef.current) {
        downloadRef.current.click();
        URL.revokeObjectURL(url);
        setCsvUrl(null);
      }
    }, 0);
  };

  return (
    <>
      <div style={{ marginTop: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} />
        <Title level={4} style={{ margin: 0 }}>
          Detailed Statistics on Student Departures
        </Title>
        <Button type="primary" onClick={handleExportCsv}>
          Export CSV
        </Button>
        <a ref={downloadRef} href={csvUrl || ''} download="expelled_students_stats.csv" style={{ display: 'none' }}>
          Download
        </a>
      </div>
      <Table
        loading={loading}
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        size="small"
      />
    </>
  );
};

export default ExpelledStudentsStats;
