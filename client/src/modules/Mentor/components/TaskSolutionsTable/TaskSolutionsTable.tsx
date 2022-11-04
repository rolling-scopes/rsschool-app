import { Col, Row, Table } from 'antd';
import React from 'react';
import { getColumns } from '.';
import { MentorDashboardDto, ProfileCourseDto } from 'api';

export interface TaskSolutionsTableProps {
  data: MentorDashboardDto[];
  course: ProfileCourseDto;
}

const getUniqueKey = (record: MentorDashboardDto) => Object.values(record).filter(Boolean).join('|');

function TaskSolutionsTable({ data, course }: TaskSolutionsTableProps) {
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
        />
      </Col>
    </Row>
  );
}

export default TaskSolutionsTable;
