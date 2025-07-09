import { ReactNode, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

enum AppTheme {
  Light,
  Dark,
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [appTheme, setAppTheme] = useState<AppTheme>(AppTheme.Light);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setAppTheme(mediaQuery.matches ? AppTheme.Dark : AppTheme.Light);

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setAppTheme(e.matches ? AppTheme.Dark : AppTheme.Light);
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: appTheme === AppTheme.Dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};
