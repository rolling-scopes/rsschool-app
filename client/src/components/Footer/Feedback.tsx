import React from 'react';
import { LikeTwoTone, FireTwoTone, HeartTwoTone, TrophyTwoTone } from '@ant-design/icons';
import { Menu } from './Menu';

const publicRoutes = [
  {
    icon: <LikeTwoTone />,
    name: 'Say Thank you (Discord >> #gratitude)',
    link: `/gratitude`,
    newTab: false,
  },
  {
    icon: <TrophyTwoTone twoToneColor="#d60000" />,
    name: 'Heroes page',
    link: `/heroes`,
    newTab: false,
  },
  {
    icon: <FireTwoTone twoToneColor="#ffa500" />,
    name: 'Feedback on Student/Mentor',
    link: `/private-feedback`,
    newTab: false,
  },
  {
    icon: <HeartTwoTone twoToneColor="#eb2f96" />,
    name: 'Feedback on RS School',
    link: `https://docs.google.com/forms/d/1F4NeS0oBq-CY805aqiPVp6CIrl4_nIYJ7Z_vUcMOFrQ/viewform`,
    newTab: true,
  },
];

export const Feedback = function() {
  return <Menu title="Feedback" data={publicRoutes} />;
};
