import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { DEFAULT_COLORS, DEFAULT_VIEW_MODE } from 'components/Schedule/constants';
import { LocalStorage, ViewMode } from './constants';

export interface ScheduleSettings {
  viewMode: ViewMode,
  setViewMode: (value: ViewMode) => void,
  limitForDoneTask: number,
  setLimitForDoneTask: (value: number) => void,
  isSplittedByWeek: boolean,
  setIsSplittedByWeek: (value: boolean) => void,
  arePassedEventsHidden: boolean,
  setArePassedEventsHidden: (value: boolean) => void,
  areDoneTasksHidden: boolean,
  setAreDoneTasksHidden: (value: boolean) => void,
  tagColors: Record<string, string>,
  setTagColors: (value: Record<string, string>) => void,
  columnsHidden: string[],
  setColumnsHidden: (value: string[]) => void,
  eventTypesHidden: string[],
  setEventTypesHidden: (value: string[]) => void,
}

const useScheduleSettings = (): ScheduleSettings => {
  const [viewMode = DEFAULT_VIEW_MODE, setViewMode] = useLocalStorage<ViewMode>(LocalStorage.ViewMode);
  const [limitForDoneTask = 100, setLimitForDoneTask] = useLocalStorage<number>(LocalStorage.LimitForDoneTasks);
  const [isSplittedByWeek = false, setIsSplittedByWeek] = useLocalStorage<boolean>(LocalStorage.IsSplittedByWeek);
  const [arePassedEventsHidden = false, setArePassedEventsHidden] = useLocalStorage<boolean>(LocalStorage.ArePassedEventsHidden);
  const [areDoneTasksHidden = false, setAreDoneTasksHidden] = useLocalStorage<boolean>(LocalStorage.AreDoneTasksHidden);
  const [tagColors = DEFAULT_COLORS, setTagColors] = useLocalStorage<Record<string, string>>(LocalStorage.TagColors);
  const [columnsHidden = [], setColumnsHidden] = useLocalStorage<string[]>(LocalStorage.ColumnsHidden);
  const [eventTypesHidden = [], setEventTypesHidden] = useLocalStorage<string[]>(LocalStorage.EventTypesHidden);

  return useMemo(() => ({
    viewMode,
    setViewMode,
    limitForDoneTask,
    setLimitForDoneTask,
    isSplittedByWeek,
    setIsSplittedByWeek,
    arePassedEventsHidden,
    setArePassedEventsHidden,
    areDoneTasksHidden,
    setAreDoneTasksHidden,
    tagColors,
    setTagColors,
    columnsHidden,
    setColumnsHidden,
    eventTypesHidden,
    setEventTypesHidden,
  }), [viewMode, limitForDoneTask, isSplittedByWeek, arePassedEventsHidden, areDoneTasksHidden, tagColors, columnsHidden, eventTypesHidden])
}

export default useScheduleSettings;
