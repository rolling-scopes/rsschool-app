import { Dropdown, Flex, MenuProps, theme as antTheme } from 'antd';
import { useTheme } from '@client/hooks';
import { AppTheme } from '@client/providers';
import { MoonOutlined, SkinOutlined, SunOutlined } from '@ant-design/icons';

const THEME_CONFIG = {
  [AppTheme.Dark]: <MoonOutlined title="Dark Color Theme" />,
  [AppTheme.Light]: <SunOutlined title="Light Color Theme" />,
  auto: <SkinOutlined title="Color Them Follows the OS Settings" />,
};

export default function ThemeSwitch() {
  const { themeChange, theme, autoTheme, changeAutoTheme } = useTheme();
  const { token } = antTheme.useToken();

  const themeIcon = autoTheme ? THEME_CONFIG.auto : THEME_CONFIG[theme];

  const items: MenuProps['items'] = [
    {
      label: THEME_CONFIG[AppTheme.Dark],
      key: 'dark',
      onClick: () => themeChange(AppTheme.Dark),
    },
    {
      label: THEME_CONFIG[AppTheme.Light],
      key: 'light',
      onClick: () => themeChange(AppTheme.Light),
    },
    {
      label: THEME_CONFIG.auto,
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
      <Dropdown menu={{ items }} placement="bottom" trigger={['click']}>
        {themeIcon}
      </Dropdown>
    </Flex>
  );
}
