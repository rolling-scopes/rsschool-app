import * as React from 'react';
import {List} from 'antd';

const githubIssuesUrl = 'https://github.com/rolling-scopes/rsschool-app/issues';

const publicRoutes = [
  {
    name: `📖 Docs`,
    link: `https://docs.rs.school`,
    newTab: true,
  },
  {
    name: `🐞 Submit "Bug"`,
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=bug_report.md`,
    newTab: false,
  },
  {
    name: `🔢 Submit "Data Issue"`,
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=data-issue-report.md&title=`,
    newTab: false,
  },
];

type LinkInfo = { name: string; link: string; newTab: boolean };

class Help extends React.Component<any, any> {
  render() {
    return (
      <div className="mt-5">
        <h4>Help</h4>
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

export { Help };
