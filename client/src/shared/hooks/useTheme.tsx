import { useContext } from 'react';
import { ThemeContext } from '@client/providers';

export function useTheme() {
  return useContext(ThemeContext);
}
