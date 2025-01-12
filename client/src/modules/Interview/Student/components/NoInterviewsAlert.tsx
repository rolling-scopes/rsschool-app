import { InfoCircleTwoTone } from '@ant-design/icons';
import { Row, Col, Alert } from 'antd';
import { AlertDescription } from './AlertDescription';

export const NoInterviewsAlert = () => (
  <Row justify="center">
    <Col xs={24} lg={12}>
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleTwoTone />}
        message="There are no planned interviews."
        description={<AlertDescription />}
      />
    </Col>
  </Row>
);
