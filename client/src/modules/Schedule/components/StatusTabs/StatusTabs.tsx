import { Tabs } from 'antd';
import { CourseScheduleItemDto } from 'api';
import { useMemo } from 'react';
import { tabsRenderer } from './renderers';

export interface StatusTabsProps {
  data: CourseScheduleItemDto[];
}

function StatusTabs({ data }: StatusTabsProps) {
  const tabs = useMemo(() => tabsRenderer(data), [data]);

  return (
    <>
      <Tabs items={tabs} />
      <style jsx>{`
        :global(.ant-tabs-tab .ant-badge-count) {
          background-color: #f0f2f5;
          color: rgba(0, 0, 0, 0.45);
        }
        :global(.ant-tabs-tab-active .ant-badge-count) {
          background-color: #E6F7FF;
          color: #1890FF;
        }
      `}</style>
    </>
  );
}

export default StatusTabs;
