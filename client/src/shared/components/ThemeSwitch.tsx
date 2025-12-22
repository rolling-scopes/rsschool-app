import { Dropdown, Flex, MenuProps, theme as antTheme } from 'antd';
import { useTheme } from 'hooks';
import { AppTheme } from '@client/providers';
import { MoonOutlined, SkinOutlined, SunOutlined } from '@ant-design/icons';
import NonTouchTooltip from '@client/shared/components/NonTouchTooltip';

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
        <NonTouchTooltip title={THEME_CONFIG[AppTheme.Dark].label}>{THEME_CONFIG[AppTheme.Dark].icon}</NonTouchTooltip>
      ),
      key: 'dark',
      onClick: () => themeChange(AppTheme.Dark),
    },
    {
      label: (
        <NonTouchTooltip title={THEME_CONFIG[AppTheme.Light].label}>
          {THEME_CONFIG[AppTheme.Light].icon}
        </NonTouchTooltip>
      ),
      key: 'light',
      onClick: () => themeChange(AppTheme.Light),
    },
    {
      label: <NonTouchTooltip title={THEME_CONFIG.auto.label}>{THEME_CONFIG.auto.icon}</NonTouchTooltip>,
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
      <NonTouchTooltip title="Change color theme">
        <Dropdown menu={{ items }} placement="bottom" trigger={['click']}>
          {themeIcon}
        </Dropdown>
      </NonTouchTooltip>
    </Flex>
  );
}
