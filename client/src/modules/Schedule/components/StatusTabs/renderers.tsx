import { Space } from 'antd';
import { ReactNode } from 'react';
import { CourseScheduleItemDtoStatusEnum } from 'api';
import { ALL_TAB_KEY, ALL_TAB_LABEL, SCHEDULE_STATUSES } from 'modules/Schedule/constants';
import { Status } from './StatusTabs';
import { CountBadge } from 'components/CountBadge';

type Item = {
  label: string;
  key: string;
  count: number;
};

type TabItem = {
  label: ReactNode;
  key: string;
};

const tabsOrder = [
  ALL_TAB_KEY,
  CourseScheduleItemDtoStatusEnum.Available,
  CourseScheduleItemDtoStatusEnum.Review,
  CourseScheduleItemDtoStatusEnum.Future,
  CourseScheduleItemDtoStatusEnum.Missed,
  CourseScheduleItemDtoStatusEnum.Done,
  CourseScheduleItemDtoStatusEnum.Archived,
];

export const tabsRenderer = (statuses: Status[], activeTab?: string): TabItem[] => {
  const initialItem = {
    label: ALL_TAB_LABEL,
    key: ALL_TAB_KEY,
    count: statuses.length,
  };

  return SCHEDULE_STATUSES.reduce(
    (
      acc: Item[],
      current: {
        value: CourseScheduleItemDtoStatusEnum;
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
    [initialItem],
  )
    .sort((prev, next) => tabsOrder.indexOf(prev.key) - tabsOrder.indexOf(next.key))
    .map(({ count, key, label }) => {
      const isTabActive = activeTab === key;
      return {
        key,
        label: count ? (
          <Space>
            {label}
            <CountBadge count={count} status={isTabActive ? 'processing' : 'default'} />
          </Space>
        ) : (
          label
        ),
      };
    });
};
