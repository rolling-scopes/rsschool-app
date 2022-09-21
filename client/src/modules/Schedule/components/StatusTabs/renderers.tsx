import { Badge, Space } from 'antd';
import { ReactNode } from 'react';
import { CourseScheduleItemDto, CourseScheduleItemDtoStatusEnum } from 'api';
import { SCHEDULE_STATUSES } from 'modules/Schedule/constants';
import { Status } from './StatusTabs';

type Item = {
  label: string;
  key: string;
  count: number;
};

type TabItem = {
  label: ReactNode;
  key: string;
};

const ALL_KEY = 'all';
const ALL_LABEL = 'All';

const tabsOrder = [
  ALL_KEY,
  CourseScheduleItemDtoStatusEnum.Available,
  CourseScheduleItemDtoStatusEnum.Review,
  CourseScheduleItemDtoStatusEnum.Future,
  CourseScheduleItemDtoStatusEnum.Missed,
  CourseScheduleItemDtoStatusEnum.Done,
  CourseScheduleItemDtoStatusEnum.Archived,
];

export const tabsRenderer = (statuses: Status[]): TabItem[] => {
  const initialItem = {
    label: ALL_LABEL,
    key: ALL_KEY,
    count: statuses.length,
  };

  return SCHEDULE_STATUSES.reduce(
    (
      acc: Item[],
      curr: {
        value: CourseScheduleItemDtoStatusEnum;
        text: string;
      },
    ): Item[] => {
      const { text, value } = curr;

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
    .map(({ count, key, label }) => ({
      label: (
        <Space>
          {label}
          <Badge count={count} />
        </Space>
      ),
      key,
    }));
};
