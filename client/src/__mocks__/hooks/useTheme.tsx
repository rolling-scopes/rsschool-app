import { vi } from 'vitest';

export const useTheme = () => ({
  theme: 'light',
  themeChange: vi.fn(),
  autoTheme: true,
  changeAutoTheme: vi.fn(),
});
