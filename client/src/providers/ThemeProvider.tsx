import { createContext, ReactNode, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

enum AppTheme {
  Light = 'light',
  Dark = 'dark',
}

type ThemeProviderType = {
  theme: AppTheme;
  themeChange: (theme: AppTheme) => void;
  autoTheme: boolean;
  changeAutoTheme: () => void;
};

const ThemeContext = createContext<ThemeProviderType>({
  theme: AppTheme.Light,
  themeChange: () => {},
  autoTheme: true,
  changeAutoTheme: () => {},
});

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [appTheme, setAppTheme] = useState<AppTheme>(AppTheme.Light);
  const [auto, setAuto] = useState<boolean>(false);
  const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';

  function getSystemTheme(): AppTheme {
    return window.matchMedia(DARK_MODE_MEDIA_QUERY).matches ? AppTheme.Dark : AppTheme.Light;
  }

  function applyTheme(newTheme: AppTheme) {
    const body = document.querySelector('body');
    if (body) {
      body.classList.remove(AppTheme.Light, AppTheme.Dark);
      body.classList.add(newTheme);
    }
    setAppTheme(newTheme);
  }

  function toggleAppTheme(newTheme: AppTheme) {
    applyTheme(newTheme);
    setAuto(false);
    localStorage.setItem('app-theme', newTheme);
  }

  function toggleAutoTheme() {
    setAuto(prev => {
      const newAutoState = !prev;
      if (newAutoState) {
        // Absence of the stored key means "follow the system preference".
        localStorage.removeItem('app-theme');
        applyTheme(getSystemTheme());
      }
      return newAutoState;
    });
  }

  useEffect(() => {
    if (!auto) return;

    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);
    applyTheme(getSystemTheme());

    const handleThemeChange = () => auto && applyTheme(getSystemTheme());
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [auto]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') as AppTheme;
    const isValidTheme = Object.values(AppTheme).includes(storedTheme);

    if (isValidTheme) {
      setAuto(false);
      applyTheme(storedTheme);
    } else {
      // No explicit light/dark choice stored (or a legacy "auto"/invalid value): follow the system.
      // Clear any stale value so auto mode stays represented by the absence of the key, then let
      // the `[auto]` effect apply the system theme and subscribe to changes.
      if (storedTheme !== null) {
        localStorage.removeItem('app-theme');
      }
      setAuto(true);
    }
  }, []);

  const lightTheme = {
    // Link color variants
    colorLink: '#4466b3',
    colorLinkHover: '#006bff',
  };

  const darkTheme = {
    // Text
    colorTextBase: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#bfffffff',
    colorTextLabel: '#c2d8d8',
    colorTextDescription: '#b5ccfb',
    colorTextPlaceholder: '#6c9cdf',
    colorTextDisabled: '#546883',

    // Link color variants
    colorLink: '#5897ee',
    colorLinkHover: '#9fc2f3',

    // Background
    colorBgContainer: '#151515',
    colorBgContainerDisabled: '#142525ff',

    // Border
    colorBorder: '#434343',
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: appTheme,
        themeChange: toggleAppTheme,
        autoTheme: auto,
        changeAutoTheme: toggleAutoTheme,
      }}
    >
      <ConfigProvider
        theme={{
          token: appTheme === AppTheme.Dark ? darkTheme : lightTheme,
          algorithm: appTheme === AppTheme.Dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider, AppTheme };
