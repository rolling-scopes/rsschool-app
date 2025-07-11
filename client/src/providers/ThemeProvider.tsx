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
  const [auto, setAuto] = useState<boolean>(true);

  function applyTheme(newTheme: AppTheme) {
    const body = document.querySelector('body');
    if (body) {
      body.classList.remove(AppTheme.Light, AppTheme.Dark);
      body.classList.add(newTheme);
    }
    setAppTheme(newTheme);
  }

  function toggleAppTheme(newTheme: AppTheme) {
    setAuto(false);
    applyTheme(newTheme);
  }

  function toggleAutoTheme() {
    setAuto(prev => !prev);
  }

  function getSystemTheme(): AppTheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? AppTheme.Dark
      : AppTheme.Light;
  }

  function updateThemeFromSystem() {
    if (auto) {
      applyTheme(getSystemTheme());
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    updateThemeFromSystem();

    const handleThemeChange = () => updateThemeFromSystem();
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [auto]);

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
          algorithm: appTheme === AppTheme.Dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider, AppTheme };
