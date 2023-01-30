import { Col, Image, Row, Typography } from 'antd';

const copyrights = `Copyright © The Rolling Scopes ${new Date().getFullYear()}`;
const logos = [
  {
    src: '/static/svg/logo-rs.svg',
    alt: 'Rolling Scopes Logo',
  },
  {
    src: '/static/svg/logo-github.svg',
    alt: 'GitHub Logo',
  },
  {
    src: '/static/svg/logo-epam.svg',
    alt: 'EPAM Logo',
  },
];

export function Footer() {
  return (
    <footer>
      <Row style={{ maxWidth: 232, paddingBlock: 36 }} gutter={[0, 10]}>
        <Col span={24}>
          <Row justify="space-between" align="middle" style={{ height: 32, paddingInline: 5.5 }}>
            {logos.map(({ src, alt }) => (
              <Image key={alt} preview={false} src={src} alt={alt} />
            ))}
          </Row>
        </Col>
        <Col span={24}>
          <Typography.Text type="secondary">{copyrights}</Typography.Text>
        </Col>
      </Row>
    </footer>
  );
}
