import { Space } from 'antd';
import { ReactNode } from 'react';
import { Status } from './TaskStatusTabs';
import { CountBadge } from 'components/CountBadge';
import { TASKS_STATUSES } from '../../constants';

type Item = {
  label: string;
  key: string;
  count: number;
};

type TabItem = {
  label: ReactNode;
  key: string;
};

export const tabsRenderer = (statuses?: Status[], activeTab?: string): TabItem[] => {
  if (!statuses) {
    return [];
  }

  return TASKS_STATUSES.reduce(
    (
      acc: Item[],
      current: {
        value: Status;
        text: string;
      },
    ): Item[] => {
      const { text, value } = current;

      const newItem: Item = {
        label: text,
        key: value,
        count: statuses.filter(el => el === value).length,
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
