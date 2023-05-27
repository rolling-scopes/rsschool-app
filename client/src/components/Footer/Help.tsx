import React from 'react';
import BookTwoTone from '@ant-design/icons/BookTwoTone';
import BugTwoTone from '@ant-design/icons/BugTwoTone';
import HddTwoTone from '@ant-design/icons/HddTwoTone';

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
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=bug-report.md`,
    newTab: true,
  },
  {
    icon: <HddTwoTone twoToneColor="#d60000" />,
    name: 'Report a data issue',
    link: `${githubIssuesUrl}/new?assignees=apalchys&labels=&template=data-issue-report.md&title=`,
    newTab: true,
  },
];

export const Help = function () {
  return <Menu title="Help" data={publicRoutes} />;
};
