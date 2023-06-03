import * as React from 'react';
import { Col, Layout, Row } from 'antd';
import { Feedback } from './Feedback';
import { Help } from './Help';
import { SocialNetworks } from './SocialNetworks';
import { Donation } from './Donation';

const { Footer } = Layout;

const maxDonatorsShown = 21;

class FooterLayout extends React.Component<any, any> {
  getYear() {
    const date = new Date();
    return date.getFullYear();
  }

  render() {
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
              <small>&copy; The Rolling Scopes {this.getYear()}</small>
            </Col>
          </Row>
        </Footer>
      </div>
    );
  }
}

export { FooterLayout };
