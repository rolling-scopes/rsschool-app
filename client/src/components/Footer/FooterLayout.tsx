import * as React from 'react';
import { Col, Layout, Row } from 'antd';
import { Feedback } from './Feedback';
import { Help } from './Help';
import { SocialNetworks } from './SocialNetworks';
import { Donation } from './Donation';

const { Footer } = Layout;

class FooterLayout extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Footer className="footer">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={16}>
              <Row>
                <Col xs={24} lg={12}><Help /></Col>
                <Col xs={24} lg={12}><Feedback /></Col>
              </Row>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Donation />
            </Col>
            <Col xs={24} sm={12} lg={16}>
              <SocialNetworks />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <small>&copy; The Rolling Scopes 2020</small>
            </Col>
          </Row>
        </Footer>
      </div>
    );
  }
}

export { FooterLayout };
