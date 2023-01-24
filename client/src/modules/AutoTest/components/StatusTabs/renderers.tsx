import { CourseTaskStatus, COURSE_TASK_STATUSES } from 'modules/AutoTest/types';
import { LabelItem, tabRenderer } from 'components/TabsWithCounter/renderers';

export const tabsRenderer = (statuses: CourseTaskStatus[], activeTab?: string) => {
  return COURSE_TASK_STATUSES.reduce<LabelItem[]>((acc, current) => {
    const { key, value } = current;

    const newItem = {
      label: value,
      key,
      count: statuses.filter(el => el === key).length || 0,
    };
    return [...acc, newItem];
  }, []).map(item => tabRenderer(item, activeTab));
};
