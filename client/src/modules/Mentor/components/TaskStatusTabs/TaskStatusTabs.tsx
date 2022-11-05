import { Tabs } from 'antd';
import { FC, useMemo } from 'react';
import { tabsRenderer } from './renderers';
import { StudentTaskSolutionItemStatus } from '../../constants';

export type Status = StudentTaskSolutionItemStatus;

export interface TaskStatusTabsProps {
  statuses?: Status[];
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

const TaskStatusTabs: FC<TaskStatusTabsProps> = ({
  statuses,
  activeTab = StudentTaskSolutionItemStatus.InReview,
  onTabChange,
}) => {
  const tabs = useMemo(() => tabsRenderer(statuses, activeTab), [statuses, activeTab]);

  const handleTabChange = (selectedTab: string) => {
    onTabChange(selectedTab);
  };

  return <Tabs tabBarStyle={{ padding: '0 24px' }} activeKey={activeTab} items={tabs} onChange={handleTabChange} />;
};

export default TaskStatusTabs;
