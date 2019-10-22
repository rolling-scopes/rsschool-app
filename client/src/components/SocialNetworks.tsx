import * as React from 'react';
import {List} from 'antd';

const socialLinks = [
  {
    name: `⭐ GitHub`,
    link: `https://github.com/rolling-scopes/rsschool-app`,
    newTab: true,
  },
  {
    name: `🔴 YouTube`,
    link: `https://www.youtube.com/c/rollingscopesschool`,
    newTab: true,
  },
  {
    name: `💬 Discord`,
    link: `https://discord.gg/PRADsJB`,
    newTab: true,
  },
];

type LinkInfo = { name: string; link: string; newTab: boolean };

class SocialNetworks extends React.Component<any, any> {
  render() {
    return (
      <div>
        <h5>Join us</h5>
      <List
        size="small"
        dataSource={socialLinks}
        renderItem={(linkInfo: LinkInfo) => (
          <List.Item key={linkInfo.link}>
            <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link}>
              {linkInfo.name}
            </a>
          </List.Item>
        )}
      />
      </div>
    );
  }
}

export { SocialNetworks };
