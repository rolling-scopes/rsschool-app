import { Dropdown, Flex, MenuProps, Space, theme as antTheme, Typography } from 'antd';
import { useTheme } from 'hooks';
import { AppTheme } from '@client/providers';
import { BulbOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';

const THEME_CONFIG = {
  [AppTheme.Dark]: {
    icon: <MoonOutlined />,
    label: 'Dark Theme',
  },
  [AppTheme.Light]: {
    icon: <SunOutlined />,
    label: 'Light Theme',
  },
  auto: {
    icon: <BulbOutlined />,
    label: 'Auto Theme',
  },
};

type ThemeSwitchProps = {
  showTitle?: boolean;
};

export default function ThemeSwitch({ showTitle }: ThemeSwitchProps) {
  console.log(showTitle);
  const { themeChange, theme, autoTheme, changeAutoTheme } = useTheme();
  const { token } = antTheme.useToken();

  const themeIcon = autoTheme ? THEME_CONFIG.auto.icon : THEME_CONFIG[theme].icon;

  const items: MenuProps['items'] = [
    {
      label: (
        <Space>
          {THEME_CONFIG[AppTheme.Dark].icon} {THEME_CONFIG[AppTheme.Dark].label}
        </Space>
      ),
      key: 'dark',
      onClick: () => themeChange(AppTheme.Dark),
    },
    {
      label: (
        <Space>
          {THEME_CONFIG[AppTheme.Light].icon} {THEME_CONFIG[AppTheme.Light].label}
        </Space>
      ),
      key: 'light',
      onClick: () => themeChange(AppTheme.Light),
    },
    {
      label: (
        <Space>
          {THEME_CONFIG.auto.icon} {THEME_CONFIG.auto.label}
        </Space>
      ),
      key: 'auto',
      onClick: () => changeAutoTheme(),
    },
  ];

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap="small"
      style={{
        fontSize: 22,
        cursor: 'pointer',
        color: token.colorTextLabel,
      }}
    >
      {showTitle && <Typography>Color theme</Typography>}
      <Dropdown menu={{ items }}>{themeIcon}</Dropdown>
    </Flex>
  );
}
