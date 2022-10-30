import { Col, Row, Table } from 'antd';
import React from 'react';
import { columns, StudentsTableProps, StudentsTableRow } from '.';

function StudentsTable({ data }: StudentsTableProps) {
  const getUniqueKey = (record: StudentsTableRow) => Object.values(record).join('|');
  
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
          columns={columns}
          dataSource={data}
          size="middle"
          rowKey={getUniqueKey}
        />
      </Col>
    </Row>
  );
}

export default StudentsTable;
