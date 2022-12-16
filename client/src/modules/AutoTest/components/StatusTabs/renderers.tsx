import { Space } from 'antd';
import { ReactNode } from 'react';
import { CountBadge } from 'components/CountBadge';
import { CourseTaskStatus, COURSE_TASK_STATUSES } from 'modules/AutoTest/types';

type Item = {
  label: string;
  key: string;
  count: number;
};

type TabItem = {
  label: ReactNode;
  key: string;
};

export const tabsRenderer = (statuses: CourseTaskStatus[], activeTab?: string): TabItem[] => {
  return COURSE_TASK_STATUSES.reduce(
    (
      acc: Item[],
      current: {
        value: CourseTaskStatus;
        key: string;
      },
    ): Item[] => {
      const { key, value } = current;

      const newItem: Item = {
        label: value,
        key,
        count: statuses.filter(el => el === key).length || 0,
      };
      return [...acc, newItem];
    },
    [],
  ).map(({ count, key, label }) => {
    const isTabActive = activeTab === key;
    return {
      key,
      label: count ? (
        <Space>
          {label}
          <CountBadge showZero count={count} status={isTabActive ? 'processing' : 'default'} />
        </Space>
      ) : (
        label
      ),
    };
  });
};
