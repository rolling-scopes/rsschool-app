import { CourseEventDtoTypeEnum } from 'api';

export const EVENT_TYPES: { id: CourseEventDtoTypeEnum; name: string }[] = [
  { name: 'Online Lecture', id: CourseEventDtoTypeEnum.LectureOnline },
  { name: 'Offline Lecture', id: CourseEventDtoTypeEnum.LectureOffline },
  { name: 'Online/Offline Lecture', id: CourseEventDtoTypeEnum.LectureMixed },
  { name: 'Self-studying', id: CourseEventDtoTypeEnum.LectureSelfStudy },
  { name: 'Warm-up', id: CourseEventDtoTypeEnum.Warmup },
  { name: 'Info', id: CourseEventDtoTypeEnum.Info },
  { name: 'Webinar', id: CourseEventDtoTypeEnum.Webinar },
  { name: 'Workshop', id: CourseEventDtoTypeEnum.Workshop },
  { name: 'Meetup', id: CourseEventDtoTypeEnum.Meetup },
  { name: 'Special', id: CourseEventDtoTypeEnum.Special },
  { name: 'Cross-Check deadline', id: CourseEventDtoTypeEnum.CrossCheckDeadline },
];

export const EVENT_TYPES_MAP = EVENT_TYPES.reduce(
  (acc, { id, name }) => ({ ...acc, [id]: name }),
  {} as Record<string, string>,
);
