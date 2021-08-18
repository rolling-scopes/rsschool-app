import { Col, Result, Row } from 'antd';
import React from 'react';

export function CourseNoAccess() {
  return (
    <Row justify="center">
      <Col md={12} xs={18} style={{ marginTop: '60px' }}>
        <Result
          status="403"
          title="403"
          subTitle="Probably you do not participate in the course. Please register or choose another course."
        />
      </Col>
    </Row>
  );
}
