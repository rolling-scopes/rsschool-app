export interface Settings {
  eventTypesHidden: string[];
  setEventTypesHidden: (value: string[]) => void;
  columnsShown: string[];
  setColumnsShown: (value: string[]) => void;
  eventTypeTagsColors: object;
  setEventTypeTagsColors: (value: object) => void;
  limitForDoneTask?: number;
  setLimitForDoneTask: (value: number) => void;
  splittedByWeek?: boolean;
  setSplittedByWeek: (value: boolean) => void;
}
