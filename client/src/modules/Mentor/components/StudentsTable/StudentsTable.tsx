import { Col, Row, Table } from 'antd';
import React from 'react';
import { getColumns, StudentsTableProps, StudentsTableRow } from '.';

const getUniqueKey = (record: StudentsTableRow) => Object.values(record).filter(Boolean).join('|');

function StudentsTable({ data, course }: StudentsTableProps) {
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

export default StudentsTable;
