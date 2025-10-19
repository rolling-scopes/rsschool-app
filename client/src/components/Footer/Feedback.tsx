import React from 'react';
import { Menu } from './Menu';
import { HeartOutlined, LikeOutlined, TrophyOutlined } from '@ant-design/icons';

const publicRoutes = [
  {
    icon: <LikeOutlined />,
    name: 'Say Thank you (Discord >> #gratitude)',
    link: `/gratitude`,
    newTab: false,
  },
  {
    icon: <TrophyOutlined style={{ color: '#d60000' }} />,
    name: 'Heroes page',
    link: `/heroes`,
    newTab: false,
  },
  {
    icon: <HeartOutlined style={{ color: '#eb2f96' }} />,
    name: 'Feedback on RS School',
    link: `https://docs.google.com/forms/d/1F4NeS0oBq-CY805aqiPVp6CIrl4_nIYJ7Z_vUcMOFrQ/viewform`,
    newTab: true,
  },
];

export const Feedback = function () {
  return <Menu title="Feedback" data={publicRoutes} />;
};
