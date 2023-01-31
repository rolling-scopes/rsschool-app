import { Card, Col, Image, Row, Typography } from 'antd';
import { SUCCESS_TEXT } from 'modules/Registry/constants';
import { ArrowIcon } from 'modules/Registry/components';

const { Title, Text } = Typography;

export function DoneSection() {
  return (
    <Card>
      <Row justify="center" gutter={[0, 28]}>
        <Col>
          <Image preview={false} src="https://cdn.rs.school/sloths/stickers/slothzy/image.png" alt="slothzy" />
        </Col>
        <Col span={24}>
          <Row justify="center" gutter={[0, 16]}>
            <Col span={24}>
              <Row justify="center">
                <Title level={3} style={{ marginBottom: 0 }}>
                  Success
                </Title>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="center">
                <Title level={3} style={{ textTransform: 'uppercase', color: '#1890FF', marginBottom: 0 }}>
                  but
                </Title>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="center">
                <ArrowIcon />
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="center">
                <Text type="secondary" style={{ maxWidth: '480px', textAlign: 'center' }}>
                  {SUCCESS_TEXT}
                </Text>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="center">
                <Text type="secondary">See you soon</Text>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}
