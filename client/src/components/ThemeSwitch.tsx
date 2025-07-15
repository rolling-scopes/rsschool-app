import { Dropdown, Flex, MenuProps, theme as antTheme, Tooltip } from 'antd';
import { useTheme } from 'hooks';
import { AppTheme } from '@client/providers';
import { MoonOutlined, SkinOutlined, SunOutlined } from '@ant-design/icons';

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
    icon: <SkinOutlined />,
    label: 'Auto Theme',
  },
};

export default function ThemeSwitch() {
  const { themeChange, theme, autoTheme, changeAutoTheme } = useTheme();
  const { token } = antTheme.useToken();

  const themeIcon = autoTheme ? THEME_CONFIG.auto.icon : THEME_CONFIG[theme].icon;

  const items: MenuProps['items'] = [
    {
      label: (
        <Tooltip title={THEME_CONFIG[AppTheme.Dark].label} placement="bottomLeft">
          {THEME_CONFIG[AppTheme.Dark].icon}
        </Tooltip>
      ),
      key: 'dark',
      onClick: () => themeChange(AppTheme.Dark),
    },
    {
      label: (
        <Tooltip title={THEME_CONFIG[AppTheme.Light].label} placement="bottomLeft">
          {THEME_CONFIG[AppTheme.Light].icon}
        </Tooltip>
      ),
      key: 'light',
      onClick: () => themeChange(AppTheme.Light),
    },
    {
      label: (
        <Tooltip title={THEME_CONFIG.auto.label} placement="bottomLeft">
          {THEME_CONFIG.auto.icon}
        </Tooltip>
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
        fontSize: 18,
        cursor: 'pointer',
        color: token.colorTextLabel,
      }}
    >
      <Tooltip title="Change color theme">
        <Dropdown menu={{ items }} placement="bottom" trigger={['click']}>
          {themeIcon}
        </Dropdown>
      </Tooltip>
    </Flex>
  );
}
