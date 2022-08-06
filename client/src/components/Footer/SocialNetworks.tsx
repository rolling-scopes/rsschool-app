import * as React from 'react';
import { Row, Col, Space } from 'antd';
import { YoutubeFilled, GithubFilled, LinkedinOutlined } from '@ant-design/icons';
import { DiscordFilled } from 'components/Icons/DiscordFilled';

const iconStyle = { fontSize: 24, color: '#000' };

const socialLinks = [
  {
    icon: <GithubFilled style={iconStyle} />,
    name: 'GitHub',
    link: `https://github.com/rolling-scopes/rsschool-app`,
    newTab: true,
  },
  {
    icon: <YoutubeFilled style={iconStyle} />,
    name: 'YouTube',
    link: `https://www.youtube.com/c/rollingscopesschool`,
    newTab: true,
  },
  {
    icon: <DiscordFilled style={iconStyle} />,
    name: 'Discord',
    link: `https://discord.gg/PRADsJB`,
    newTab: true,
  },
  {
    icon: <LinkedinOutlined style={iconStyle} />,
    name: 'LinkedIn',
    link: `https://www.linkedin.com/company/the-rolling-scopes-school/`,
    newTab: true,
  },
];

type LinkInfo = { icon: React.ReactNode; name: string; link: string; newTab: boolean };

class SocialNetworks extends React.Component<any, any> {
  render() {
    return (
      <Row gutter={[16, 8]}>
        {socialLinks.map((linkInfo: LinkInfo) => {
          return (
            <Col key={linkInfo.link}>
              <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link} style={{ color: '#202020' }}>
                <Space>
                  {linkInfo.icon}
                  {linkInfo.name}
                </Space>
              </a>
            </Col>
          );
        })}
      </Row>
    );
  }
}

export { SocialNetworks };
