import React, { PropsWithChildren, ForwardRefExoticComponent } from 'react';
import { Collapse, Typography } from 'antd';

const { Text } = Typography;
const { Panel } = Collapse;

type SettingsItemProps = PropsWithChildren & {
  header: string;
  /** Any antd icon */
  IconComponent: ForwardRefExoticComponent<any>;
};

const SettingsItem: React.FC<SettingsItemProps> = ({ children, header, IconComponent }) => {
  return (
    <Collapse
      style={{ marginBottom: 10 }}
      expandIcon={() => <IconComponent style={{ fontSize: '20px', color: '#08c' }} />}
    >
      <Panel header={<Text strong>{header}</Text>} key={header}>
        {children}
      </Panel>
    </Collapse>
  );
};

export default SettingsItem;
