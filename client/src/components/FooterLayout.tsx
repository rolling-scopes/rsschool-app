import * as React from 'react';
import { Col, Layout, Row, Divider, Button } from 'antd';
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
          <h5> Thank you for your support! 🎉</h5>
          <p>
            <object
              type="image/svg+xml"
              data="https://opencollective.com/rsschool/backers.svg?avatarHeight=36&button=false&width=300"
            />
          </p>
          <p>
            <Button size="small" href="https://opencollective.com/rsschool#section-contribute" target="_blank" ghost>
              ❤️ Make a donation
            </Button>
          </p>
          <p className="text-center">
            <small>&copy; The Rolling Scopes 2020</small>
          </p>
        </Footer>
      </div>
    );
  }
}

export { FooterLayout };
