import { Col, Row, Table } from 'antd';
import React from 'react';
import { columns } from '.';

function StudentsTable() {
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
          dataSource={[]}
          size="middle"
        />
      </Col>
    </Row>
  );
}

export default StudentsTable;
