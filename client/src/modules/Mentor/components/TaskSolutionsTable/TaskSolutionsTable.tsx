import { Col, Row, Table } from 'antd';
import React from 'react';
import { getColumns } from '.';
import { MentorDashboardDto, ProfileCourseDto } from 'api';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

export interface TaskSolutionsTableProps {
  mentorId: number | null;
  course: ProfileCourseDto;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ mentorId, course }: TaskSolutionsTableProps) {
  const [data, loading] = useMentorDashboard(mentorId, course.id);

  return (
    <Row>
      <Col span={24}>
        <Table
          locale={{
            // disable default tooltips on sortable columns
            triggerDesc: undefined,
            triggerAsc: undefined,
            cancelSort: undefined,
          }}
          pagination={false}
          columns={getColumns(course)}
          dataSource={data}
          size="middle"
          rowKey={getUniqueKey}
          loading={loading}
        />
      </Col>
    </Row>
  );
}

export default TaskSolutionsTable;
