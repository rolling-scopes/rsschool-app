import { Space, theme, Typography } from 'antd';
import { DiscordFilled, LinkedInIcon, TelegramIcon } from 'components/Icons';
import { GithubOutlined } from '@ant-design/icons';

const { Link, Text } = Typography;

const getSocialLinkIcon = (title: string, color?: string) => {
  switch (title) {
    case 'discord':
      return <DiscordFilled style={{ fontSize: '24px', color: '#5865F2' }} />;
    case 'linkedin':
      return <LinkedInIcon />;
    case 'telegram':
      return <TelegramIcon />;
    case 'github':
      return <GithubOutlined style={{ fontSize: '24px', color: color }} />;
    default:
      break;
  }
};

export const renderSocialLinks = (links: Record<'title' | 'url', string>[]) => {
  const { token } = theme.useToken();
  return (
    <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
      {links.map(link =>
        link.url ? (
          <Link key={link.title} href={link.url} target="_blank">
            {getSocialLinkIcon(link.title, token.colorTextBase)}
          </Link>
        ) : (
          <span key={link.title} style={{ cursor: 'not-allowed', opacity: 0.5 }}>
            {getSocialLinkIcon(link.title, token.colorTextBase)}
          </span>
        ),
      )}
    </Space>
  );
};

export const renderDescription = (text: string) => {
  return (
    <Text>
      <div
        dangerouslySetInnerHTML={{
          __html: text,
        }}
      />
    </Text>
  );
};
