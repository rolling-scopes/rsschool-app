import React from 'react';
import { Menu } from './Menu';
import { BookOutlined, BugOutlined, HddOutlined } from '@ant-design/icons';

const githubIssuesUrl = 'https://github.com/rolling-scopes/rsschool-app/issues';
const publicRoutes = [
  {
    icon: <BookOutlined style={{ color: '#52c41a' }} />,
    name: 'Docs',
    link: 'https://docs.rs.school',
    newTab: true,
  },
  {
    icon: <BugOutlined style={{ color: '#d60000' }} />,
    name: 'Report a bug',
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=bug-report.md`,
    newTab: true,
  },
  {
    icon: <HddOutlined style={{ color: '#d60000' }} />,
    name: 'Report a data issue',
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=data-issue-report.md&title=`,
    newTab: true,
  },
];

export const Help = function () {
  return <Menu title="Help" data={publicRoutes} />;
};
