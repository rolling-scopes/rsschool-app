import { Flex, Space, theme, Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

export type ListItemMetaProps = {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function ListItemMeta({ avatar, title, description, style, className }: ListItemMetaProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      gap={token.marginSM}
      style={{ paddingBlock: token.paddingSM, ...style }}
      className={className}
    >
      {avatar !== undefined && <Space>{avatar}</Space>}
      {(title !== undefined || description !== undefined) && (
        <Flex vertical gap={token.marginXXS}>
          {title !== undefined && <Typography.Text strong>{title}</Typography.Text>}
          {description !== undefined && (
            <Flex vertical style={{ color: token.colorTextDescription }}>
              {description}
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}
