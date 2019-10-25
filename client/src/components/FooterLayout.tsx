import * as React from 'react';
import { Col, Layout, Row, Divider } from 'antd';
import { Feedback } from './Feedback';
import { Help } from './Help';
import { SocialNetworks } from './SocialNetworks';

const { Footer } = Layout;

class FooterLayout extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Footer className="footer-dark">
          <Row gutter={40}>
            <Col xs={24} sm={8} md={8} lg={8}>
              <Feedback />
            </Col>
            <Col xs={24} sm={8} md={8} lg={8}>
              <Help />
            </Col>
            <Col xs={24} sm={8} md={8} lg={8}>
              <SocialNetworks />
            </Col>
          </Row>
          <Divider />
          <div className="text-center">
            <small>&copy; The Rolling Scopes 2019</small>
          </div>
        </Footer>
      </div>
    );
  }
}

export { FooterLayout };
