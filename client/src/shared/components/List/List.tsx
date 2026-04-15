import { Empty, Flex, Space, theme } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { getKey } from '@client/shared/components/List/List.utils';

export type ListProps<T> = {
  dataSource?: T[];
  renderItem: (item: T, index: number) => ReactNode;
  size?: 'default' | 'small' | 'large';
  bordered?: boolean;
  header?: ReactNode;
  itemLayout?: 'horizontal' | 'vertical';
  split?: boolean;
  rowKey?: string | ((item: T) => string);
  style?: CSSProperties;
  className?: string;
};

export function List<T>({
  dataSource,
  renderItem,
  size = 'default',
  bordered = false,
  header,
  itemLayout = 'vertical',
  split = true,
  rowKey,
  style,
  className,
}: ListProps<T>) {
  const { token } = theme.useToken();

  const paddingMap = {
    large: { v: token.paddingMD, h: token.paddingLG },
    default: { v: token.paddingXS, h: token.paddingLG },
    small: { v: token.paddingXS, h: token.paddingSM },
  };

  const padding = paddingMap[size];

  const listLayout = itemLayout === 'horizontal' ? 'row' : 'column';

  const containerStyle: CSSProperties = {
    ...(bordered
      ? {
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          padding: `${padding.v}px ${padding.h}px`,
        }
      : {}),
    ...style,
  };

  return (
    <Flex vertical data-size={size} style={containerStyle} className={className}>
      {header && (
        <Space
          style={{
            borderBottom: `1px solid ${token.colorSplit}`,
            marginBottom: `${padding.v}px`,
          }}
        >
          {header}
        </Space>
      )}
      {(!dataSource || dataSource?.length) === 0 ? (
        <Flex style={{ padding: `${token.padding}px`, alignItems: 'center', justifyContent: 'center' }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Flex>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: `0`,
            margin: '0',
            display: 'flex',
            flexDirection: listLayout,
            gap: `${padding.v}px`,
          }}
        >
          {dataSource?.map((item, index) => (
            <li
              key={getKey(item, index, rowKey)}
              data-testid={`list-item-${index}`}
              style={{
                paddingBottom: split && index < dataSource.length - 1 ? `${padding.v}px` : '0',
                borderBottom: split && index < dataSource.length - 1 ? `1px solid ${token.colorSplit}` : undefined,
              }}
            >
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}
    </Flex>
  );
}
