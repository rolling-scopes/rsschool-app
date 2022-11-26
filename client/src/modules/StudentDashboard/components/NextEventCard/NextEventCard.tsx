import * as React from 'react';
import CommonCard from '../CommonDashboardCard';
import { Typography, Table } from 'antd';
import { getAvailableTasksColumns } from './renderers';
import { CourseScheduleItemDto } from 'api';

const { Link } = Typography;

type Props = {
  nextEvents: CourseScheduleItemDto[];
  courseAlias: string;
};

function NextEventCard({ nextEvents, courseAlias }: Props) {
  const columns = getAvailableTasksColumns();

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
            className="next-event-card-table"
          />
        }
      />
      <style jsx>{`
        :global(.next-event-card-table .ant-table-thead) {
          display: none;
        }
        :global(.next-event-card-table tr:last-child > td) {
          border-bottom: none;
        }
      `}</style>
    </>
  );
}

export default NextEventCard;
