import * as React from 'react';
import {List} from 'antd';

const publicRoutes = [
  {
    name: `👏 Say Thank you (Discord >> #gratitude)`,
    link: `/gratitude`,
    newTab: false,
  },
  {
    name: `💌 Feedback on Student/Mentor`,
    link: `/private-feedback`,
    newTab: false,
  },
  {
    name: `📝 Feedback on RS School`,
    link: `https://docs.google.com/forms/d/1F4NeS0oBq-CY805aqiPVp6CIrl4_nIYJ7Z_vUcMOFrQ/viewform`,
    newTab: true,
  },
];

type LinkInfo = { name: string; link: string; newTab: boolean };

class Feedback extends React.Component<any, any> {
  render() {
    return (
      <div className="mt-5">
        <h4>Feedback</h4>
      <List
        bordered
        size="small"
        dataSource={publicRoutes}
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

export { Feedback };
