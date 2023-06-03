import { Tabs } from 'antd';
import { FC, useMemo } from 'react';
import { tabsRenderer } from './renderers';
import { SolutionItemStatus } from '../../constants';

export type Status = SolutionItemStatus;

export interface TaskStatusTabsProps {
  statuses?: Status[];
  activeTab?: Status;
  onTabChange: (tab: Status) => void;
}

const TaskStatusTabs: FC<TaskStatusTabsProps> = ({ statuses, activeTab, onTabChange }) => {
  const tabs = useMemo(() => tabsRenderer(statuses, activeTab), [statuses, activeTab]);

  const handleTabChange = (selectedTab: string) => {
    onTabChange(selectedTab as Status);
  };

  return <Tabs tabBarStyle={{ padding: '0 24px' }} activeKey={activeTab} items={tabs} onChange={handleTabChange} />;
};

export default TaskStatusTabs;
