import { Col, Row, Typography } from 'antd';
import { EpamLogoIcon, GitHubLogoIcon, RSLogoIcon } from 'components/Icons';

const { Text } = Typography;
const copyrights = `Copyright © The Rolling Scopes ${new Date().getFullYear()}`;

export function Footer() {
  return (
    <footer>
      <Row style={{ maxWidth: 232, paddingBlock: 36 }} gutter={[0, 10]}>
        <Col span={24}>
          <Row justify="space-between" align="middle" style={{ height: 32, paddingInline: 5.5 }}>
            <RSLogoIcon />
            <EpamLogoIcon />
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
