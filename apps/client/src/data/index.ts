import { EVENT_TYPES_MAP } from './eventTypes';
import { TASK_TYPES_MAP } from './taskTypes';

export const TASK_EVENT_TYPES_MAP = {
  ...TASK_TYPES_MAP,
  ...EVENT_TYPES_MAP,
};
