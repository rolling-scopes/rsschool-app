import * as React from 'react';
import CommonCard from './CommonDashboardCard';
import { CourseEvent } from 'services/course';
import { Typography, Table } from 'antd';

const { Link } = Typography;

type Props = {
  nextEvents: CourseEvent[];
  courseAlias: string;
};

enum ColumnKey {
  Name = 'name',
  Status = 'status',
  EndDate = 'end-date',
}

export function NextEventCard({ nextEvents, courseAlias }: Props) {
  const columns = [
    {
      key: ColumnKey.Name,
      dataIndex: 'event.name',
      render: (value: string, row: CourseEvent) => {
        if (!row.event.descriptionUrl) return value;

        return (
          <a target="_blank" href={row.event.descriptionUrl}>
            {row.event.name}
          </a>
        );
      },
    },
    {
      key: ColumnKey.Status,
      dataIndex: 'status',
      // render: statusRenderer,
      render: () => {
        return 'status';
      },
    },
    {
      key: ColumnKey.EndDate,
      dataIndex: 'dateTime',
      // render: coloredDateRenderer(timezone, 'YYYY-MM-DD HH:mm', 'start', 'Recommended date for studying'),
      render: (_: string, row: CourseEvent) => {
        return row.dateTime;
      },
    },
  ];

  return (
    <>
      <CommonCard
        title="Available Tasks"
        extra={<Link href={`/course/schedule?course=${courseAlias}`}>View all</Link>}
        content={
          <Table
            locale={{
              // disable default tooltips on sortable columns
              triggerDesc: undefined,
              triggerAsc: undefined,
              cancelSort: undefined,
            }}
            pagination={false}
            dataSource={nextEvents}
            rowKey="id"
            size="middle"
            columns={columns}
          />
        }
      />
      <style jsx>{`
        :global(.ant-table-thead) {
          display: none;
        }
      `}</style>
    </>
  );
}
