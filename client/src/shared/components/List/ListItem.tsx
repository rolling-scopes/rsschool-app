import type { CSSProperties, ReactNode } from 'react';
import { Flex } from 'antd';

export type ListItemProps = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function ListItem({ children, style, className }: ListItemProps) {
  return (
    <Flex align="center" wrap style={style} className={className}>
      {children}
    </Flex>
  );
}
