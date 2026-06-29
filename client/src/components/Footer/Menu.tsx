import React from 'react';
import { Flex, Space, theme, Typography } from 'antd';
import Link from 'next/link';

type LinkInfo = { icon: React.ReactNode; name: string; link: string; newTab: boolean };

type MenuProps = {
  title: string;
  data: LinkInfo[];
};

function Menu({ title, data }: MenuProps) {
  const { token } = theme.useToken();
  return (
    <Flex orientation="vertical" gap={16}>
      <Typography.Title level={5}>{title}</Typography.Title>
      <Flex orientation="vertical" gap={8} style={{ paddingBottom: '1rem' }}>
        {data.map(({ link, newTab, icon, name }, index) => (
          <Space
            key={link}
            style={{
              borderBottom: index === data.length - 1 ? 'none' : `${token.lineWidth}px solid ${token.colorBorder}`,
              paddingBottom: 12,
              paddingInlineStart: 12,
            }}
          >
            <Link prefetch={false} href={link} target={newTab ? '_blank' : '_self'}>
              {icon}&nbsp;{name}
            </Link>
          </Space>
        ))}
      </Flex>
    </Flex>
  );
}

export { Menu };
