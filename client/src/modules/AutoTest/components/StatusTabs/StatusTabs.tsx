import { Col, Row, Tabs } from 'antd';
import { useMemo } from 'react';
import { CourseTaskStatus } from 'modules/AutoTest/types';
import { tabsRenderer } from './renderers';

export interface StatusTabsProps {
  statuses: CourseTaskStatus[];
  activeTab?: CourseTaskStatus;
  onTabChange: (tab: CourseTaskStatus) => void;
}

const StatusTabs = ({ statuses, activeTab, onTabChange }: StatusTabsProps) => {
  const tabs = useMemo(() => tabsRenderer(statuses, activeTab), [statuses, activeTab]);

  const handleTabChange = (selectedTab: string) => {
    onTabChange(selectedTab as CourseTaskStatus);
  };

  return <Tabs tabBarStyle={{ marginBottom: 0 }} activeKey={activeTab} items={tabs} onChange={handleTabChange} />;
};

export default StatusTabs;
