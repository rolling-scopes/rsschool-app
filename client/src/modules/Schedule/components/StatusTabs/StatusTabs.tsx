import { Tabs } from 'antd';
import { useMemo } from 'react';
import { tabsRenderer } from './renderers';

export type Status = string;

export interface StatusTabsProps {
  statuses: Status[];
  onTabChange: (tab: string) => void;
}

function StatusTabs({ statuses, onTabChange }: StatusTabsProps) {
  const tabs = useMemo(() => tabsRenderer(statuses), [statuses]);

  const handleTabChange = (activeTab: string) => {
    onTabChange(activeTab);
  };

  return (
    <>
      <Tabs items={tabs} onChange={handleTabChange} />
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
}

export default StatusTabs;
