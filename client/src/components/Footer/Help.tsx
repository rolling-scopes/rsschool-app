import React from 'react';
import { BookTwoTone, BugTwoTone, HddTwoTone } from '@ant-design/icons';

import { Menu } from './Menu';

const githubIssuesUrl = 'https://github.com/rolling-scopes/rsschool-app/issues';
const publicRoutes = [
  {
    icon: <BookTwoTone twoToneColor="#52c41a" />,
    name: 'Docs',
    link: 'https://docs.rs.school',
    newTab: true,
  },
  {
    icon: <BugTwoTone twoToneColor="#d60000" />,
    name: 'Report a bug',
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=bug_report.md`,
    newTab: false,
  },
  {
    icon: <HddTwoTone twoToneColor="#d60000" />,
    name: 'Report a data issue',
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=data-issue-report.md&title=`,
    newTab: false,
  },
];

export const Help = function() {
  return <Menu title="Help" data={publicRoutes} />;
};
