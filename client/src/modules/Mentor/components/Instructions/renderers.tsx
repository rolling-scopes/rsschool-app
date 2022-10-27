import { Space, Typography } from 'antd';
import { DiscordFilled, LinkedInIcon, TelegramIcon } from 'components/Icons';
import { GithubOutlined } from '@ant-design/icons';

const { Link } = Typography;

const getSocialLinkIcon = (title: string) => {
  switch (title) {
    case 'discord':
      return <DiscordFilled style={{ fontSize: '24px', color: '#5865F2' }} />;
    case 'linkedin':
      return <LinkedInIcon />;
    case 'telegram':
      return <TelegramIcon />;
    case 'github':
      return <GithubOutlined style={{ fontSize: '24px', color: 'black' }} />;
    default:
      break;
  }
};

export const renderSocialLinks = (links: Record<'title' | 'url', string>[]) => (
  // TODO: center
  <Space size="middle">
    {links.map(link => (
      <Link key={link.title} href={link.url} target="_blank">
        {getSocialLinkIcon(link.title)}
      </Link>
    ))}
  </Space>
);
