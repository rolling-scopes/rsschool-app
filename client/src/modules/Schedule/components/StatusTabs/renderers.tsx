import { CourseScheduleItemDtoStatusEnum } from 'api';
import { ALL_TAB_KEY, ALL_TAB_LABEL, SCHEDULE_STATUSES } from 'modules/Schedule/constants';
import { Status } from './StatusTabs';
import { LabelItem, tabRenderer } from 'components/TabsWithCounter/renderers';

const tabsOrder = [
  ALL_TAB_KEY,
  CourseScheduleItemDtoStatusEnum.Available,
  CourseScheduleItemDtoStatusEnum.Review,
  CourseScheduleItemDtoStatusEnum.Future,
  CourseScheduleItemDtoStatusEnum.Missed,
  CourseScheduleItemDtoStatusEnum.Done,
  CourseScheduleItemDtoStatusEnum.Registered,
  CourseScheduleItemDtoStatusEnum.Unavailable,
  CourseScheduleItemDtoStatusEnum.Archived,
];

export const tabsRenderer = (statuses: Status[], activeTab?: string) => {
  const initialItem = {
    label: ALL_TAB_LABEL,
    key: ALL_TAB_KEY,
    count: statuses.length,
  };

  return SCHEDULE_STATUSES.reduce<LabelItem[]>(
    (acc, current) => {
      const { text, value } = current;

      const newItem = {
        label: text,
        key: value,
        count: statuses.filter(el => el === value).length,
      };
      return [...acc, newItem];
    },
    [initialItem],
  )
    .sort((prev, next) => tabsOrder.indexOf(prev.key) - tabsOrder.indexOf(next.key))
    .map(item => tabRenderer(item, activeTab));
};
