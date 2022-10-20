import { Tabs } from 'antd';
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
  const tabs = useMemo(() => tabsRenderer(statuses), [statuses]);

  const handleTabChange = (selectedTab: string) => {
    onTabChange(selectedTab);
  };

  const getActiveTab = () => (!activeTab || Array.isArray(activeTab) ? ALL_TAB_KEY : activeTab);

  return (
    <>
      <Tabs activeKey={getActiveTab()} items={tabs} onChange={handleTabChange} tabBarExtraContent={children} />
      <style jsx>{`
        :global(.ant-tabs-tab .ant-badge-count) {
          background-color: #f0f2f5;
          color: rgba(0, 0, 0, 0.45);
        }
        :global(.ant-tabs-tab-active .ant-badge-count) {
          background-color: #e6f7ff;
          color: #1890ff;
        }
      `}</style>
    </>
  );
};

export default StatusTabs;
