import React from 'react';
import { List } from 'antd';

type LinkInfo = { icon: React.ReactNode; name: string; link: string; newTab: boolean };

class Menu extends React.Component<any, any> {
  render() {
    return (
      <div style={{ marginBottom: 16 }}>
        <h3>{this.props.title}</h3>
        <List
          size="small"
          dataSource={this.props.data}
          renderItem={(linkInfo: LinkInfo) => (
            <List.Item key={linkInfo.link}>
              <a target={linkInfo.newTab ? '_blank' : '_self'} href={linkInfo.link}>
                {linkInfo.icon}&nbsp;
                {linkInfo.name}
              </a>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export { Menu };
