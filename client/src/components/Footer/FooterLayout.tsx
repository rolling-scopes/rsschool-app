import { Col, Layout, Row } from 'antd';

const { Footer } = Layout;

const maxDonatorsShown = 21;

const FooterLayout = () => {
  const getYearHandler = useCallback(() => {
    const date = new Date();
    return date.getFullYear();
  }, []);

  return (
    <div>
      <Footer className="footer">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={16}>
            <Row>
              <Col xs={24} lg={12}>
                <Help />
              </Col>
              <Col xs={24} lg={12}>
                <Feedback />
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Donation maxDonatorsShown={maxDonatorsShown} />
          </Col>
          <Col xs={24} sm={12} lg={16}>
            <SocialNetworks />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <small>&copy; The Rolling Scopes {getYearHandler()}</small>
          </Col>
        </Row>
      </Footer>
    </div>
  );
};

export { FooterLayout };
