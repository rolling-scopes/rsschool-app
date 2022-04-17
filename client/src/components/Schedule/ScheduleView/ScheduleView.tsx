import React from 'react';
import { CourseEvent } from 'services/course';
import { TableView } from '../TableView';
import { ListView } from '../ListView';
import { CalendarView } from '../CalendarView';
import { ScheduleSettings } from '../useScheduleSettings';
import { ViewMode } from '../constants';

const DEFAULT_SCHEDULE_VIEW = TableView;
const SCHEDULE_VIEWS = {
  [ViewMode.Table]: TableView,
  [ViewMode.List]: ListView,
  [ViewMode.Calendar]: CalendarView,
};

export interface ScheduleViewProps {
  isAdmin: boolean;
  courseId: number;
  courseAlias: string;
  settings: ScheduleSettings;
  data: CourseEvent[];
  refreshData: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = props => {
  const ScheduleComponent = SCHEDULE_VIEWS[props.settings.viewMode] ?? DEFAULT_SCHEDULE_VIEW;
  return <ScheduleComponent {...props} />;
};

export default ScheduleView;
