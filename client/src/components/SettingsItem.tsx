import { ForwardRefExoticComponent, PropsWithChildren, ReactNode, RefAttributes } from 'react';
import { Collapse, Divider, Flex, theme, Typography } from 'antd';
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

const { Text } = Typography;
const { Panel } = Collapse;

type SettingsItemProps = PropsWithChildren & {
  header: string;
  /** Any antd icon */
  IconComponent: ForwardRefExoticComponent<Omit<AntdIconProps, 'ref'> & RefAttributes<HTMLSpanElement>>;
  actions?: ReactNode[];
};

const SettingsItem = ({ children, header, IconComponent, actions }: SettingsItemProps) => {
  const { token } = theme.useToken();
  return (
    <Collapse
      style={{ marginBottom: 10 }}
      expandIcon={() => <IconComponent style={{ fontSize: '1.2rem', color: token.blue7 }} />}
    >
      <Panel header={<Text strong>{header}</Text>} key={header}>
        <Flex vertical>
          <Flex vertical style={{ maxHeight: '70cqh', overflow: 'auto' }}>
            {children}
          </Flex>
          {actions && <Divider />}
          <Flex justify="space-evenly">{actions?.map(action => action)}</Flex>
        </Flex>
      </Panel>
    </Collapse>
  );
};

export default SettingsItem;
