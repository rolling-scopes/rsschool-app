import { useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { DEFAULT_COLORS, LocalStorageKeys } from 'modules/Schedule/constants';

export interface ScheduleSettings {
  timezone: string;
  setTimezone: (value: string) => void;
  tagColors: Record<string, string>;
  setTagColors: (value: Record<string, string>) => void;
  columnsHidden: string[];
  setColumnsHidden: (value: string[]) => void;
  eventTypesHidden: string[];
  setEventTypesHidden: (value: string[]) => void;
}

export const useScheduleSettings = (): ScheduleSettings => {
  const [tagColors = DEFAULT_COLORS, setTagColors] = useLocalStorage<Record<string, string>>(
    LocalStorageKeys.TagColors,
  );
  const [columnsHidden = [], setColumnsHidden] = useLocalStorage<string[]>(LocalStorageKeys.ColumnsHidden);
  const [eventTypesHidden = [], setEventTypesHidden] = useLocalStorage<string[]>(LocalStorageKeys.EventTypesHidden);
  const [timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, setTimezone] = useLocalStorage<string>(
    LocalStorageKeys.Timezone,
  );

  return useMemo(
    () => ({
      timezone,
      setTimezone,
      tagColors,
      setTagColors,
      columnsHidden,
      setColumnsHidden,
      eventTypesHidden,
      setEventTypesHidden,
    }),
    [timezone, tagColors, columnsHidden, eventTypesHidden],
  );
};
