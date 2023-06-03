import { MenuItemType } from '../AdditionalActions';

export const buildMenuItem = (title: string, icon: React.ReactNode, isVisible: boolean): MenuItemType | null =>
  isVisible
    ? {
        key: title,
        label: title,
        icon: icon,
      }
    : null;
