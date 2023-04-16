import { Button, Col, Image, Layout, Row } from 'antd';
import { COLORS } from '../theme/colors';

const { Header: HeaderAnt } = Layout;

export const Header = () => {
  return (
    <HeaderAnt style={{ background: COLORS.GREY }}>
      <Row justify="space-between">
        <Col>
          <Image src="/static/svg/jobs/rs-jobs-logo.svg" alt="logo_rs-jobs" preview={false} />
        </Col>
        <Col>
          <Button
            ghost
            style={{ color: COLORS.YELLOW, borderColor: COLORS.YELLOW }}
            onClick={() => (window.location.href = `/api/v2/auth/github/login`)}
          >
            Sign in
          </Button>
        </Col>
      </Row>
    </HeaderAnt>
  );
};
