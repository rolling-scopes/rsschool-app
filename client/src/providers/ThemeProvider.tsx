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
        localStorage.setItem('app-theme', 'auto');
        // FIXME: remove the line above and uncomment the line bellow
        //  after enabling auto-theme
        // localStorage.removeItem('app-theme');
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
      // setAuto(true); // FIXME: temporary disable set auto theme by default
    }

    // FIXME: remove the if statement after enabling auto-theme above
    if ((storedTheme as string) === 'auto') {
      setAuto(true);
    }
  }, []);

  const { token } = theme.useToken();

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
        <style jsx global>{`
          :root::-webkit-scrollbar-thumb,
          textarea::-webkit-scrollbar-thumb {
            background: var(--scroll-color);
          }

          :global(.ant-table) {
            :global(.ant-table-container) {
              :global(.ant-table-body),
              :global(.ant-table-content) {
                scrollbar-width: thin;
                scrollbar-color: var(--scroll-color) transparent;
                scrollbar-gutter: stable;
              }
            }
          }

          :global(.ant-modal-content) {
            scrollbar-width: thin;
            scrollbar-color: var(--scroll-color) transparent;
            scrollbar-gutter: stable;
          }
        `}</style>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider, AppTheme };
