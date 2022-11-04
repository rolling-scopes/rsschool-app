import { Col, Row, Tabs } from 'antd';
import { FC, useMemo } from 'react';
import { ALL_TAB_KEY } from 'modules/Schedule/constants';
import { tabsRenderer } from './renderers';

export type Status = string;

export interface StatusTabsProps {
  statuses: Status[];
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

const StatusTabs: FC<StatusTabsProps> = ({ statuses, activeTab, onTabChange, children }) => {
  const tabs = useMemo(() => tabsRenderer(statuses, activeTab), [statuses, activeTab]);

  const handleTabChange = (selectedTab: string) => {
    onTabChange(selectedTab);
  };

  const getActiveTab = () => (!activeTab || Array.isArray(activeTab) ? ALL_TAB_KEY : activeTab);

  return (
    <Row gutter={48} style={{ background: 'white' }}>
      <Col span={24}>
        <Tabs
          tabBarStyle={{ marginBottom: 0 }}
          activeKey={getActiveTab()}
          items={tabs}
          onChange={handleTabChange}
          tabBarExtraContent={children}
        />
      </Col>
    </Row>
  );
};

export default StatusTabs;
