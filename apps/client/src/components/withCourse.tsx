import { Alert, Col, Row } from 'antd';
import * as React from 'react';

export function withCourse(WrappedComponent: React.ComponentType<any>) {
  return (props: any) => {
    if (props.course || props.course === undefined) {
      return <WrappedComponent {...props} />;
    }
    return (
      <Row justify="center">
        <Col md={12} xs={18} style={{ marginTop: '60px' }}>
          <Alert
            message="No Access"
            description="Probably you do not participate in the course. Please register or choose another course."
            type="error"
          />
        </Col>
      </Row>
    );
  };
}
