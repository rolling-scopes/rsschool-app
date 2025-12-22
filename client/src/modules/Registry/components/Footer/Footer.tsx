import { Col, Row, Typography } from 'antd';
import { GitHubLogoIcon, RSLogoIcon } from '@client/shared/components/Icons';

const { Text } = Typography;
const copyrights = `Copyright © The Rolling Scopes ${new Date().getFullYear()}`;

export function Footer() {
  return (
    <footer>
      <Row style={{ maxWidth: 232, paddingBlock: 36 }} gutter={[0, 10]}>
        <Col span={24}>
          <Row justify="center" align="middle" style={{ height: 32, paddingInline: 5.5, gap: 24 }}>
            <RSLogoIcon />
            <GitHubLogoIcon />
          </Row>
        </Col>
        <Col span={24}>
          <Text type="secondary">{copyrights}</Text>
        </Col>
      </Row>
    </footer>
  );
}
