import { PropsWithChildren, ReactNode, CSSProperties, ComponentType } from 'react';
import { Collapse, Divider, Flex, theme, Typography } from 'antd';

const { Text } = Typography;
const { Panel } = Collapse;

type SettingsItemProps = PropsWithChildren & {
  header: string;
  /** Any antd icon */
  IconComponent: ComponentType<{ style?: CSSProperties }>;
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
          <Flex vertical style={{ maxHeight: 'calc(100cqh - 11rem)', overflow: 'auto' }}>
            {children}
          </Flex>
          {actions && <Divider />}
          <Flex>{actions?.map(action => action)}</Flex>
        </Flex>
      </Panel>
    </Collapse>
  );
};

export default SettingsItem;
