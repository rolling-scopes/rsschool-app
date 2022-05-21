import moment from 'moment';
import { CourseEvent, CourseTaskDetails } from 'services/course';

export interface ScheduleEvent {
  id: number;
  category: 'task' | 'event';
  entity: CourseEvent | CourseTaskDetails;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  descriptionUrl: string | null;
  organizer: {
    id: number | null;
    githubId: string | null;
  };
  score: {
    total: number;
    max: number;
    weight: number;
    donePercent: number;
  } | null;
}

export const courseEventToScheduleEvent = (courseEvent: CourseEvent): ScheduleEvent => ({
  id: courseEvent.id,
  category: 'event',
  entity: courseEvent,
  name: courseEvent.event.name,
  type: courseEvent.event.type,
  startDate: courseEvent.dateTime,
  endDate: moment(courseEvent.dateTime).add(courseEvent.duration, 'hours').toISOString(),
  organizer: {
    id: courseEvent.organizer?.id ?? null,
    githubId: courseEvent.organizer?.githubId ?? null,
  },
  descriptionUrl: courseEvent.event.descriptionUrl ?? null,
  score: null,
});

export const courseTaskToScheduleEvent = (courseTask: CourseTaskDetails): ScheduleEvent => ({
  id: courseTask.id,
  category: 'task',
  entity: courseTask,
  name: courseTask.name,
  type: courseTask.type,
  startDate: courseTask.studentStartDate ?? '',
  endDate: courseTask.studentEndDate ?? '',
  descriptionUrl: courseTask.descriptionUrl ?? null,
  organizer: {
    id: courseTask.taskOwner?.id ?? null,
    githubId: courseTask.taskOwner?.githubId ?? null,
  },
  score: {
    total: courseTask.score ?? 0,
    max: courseTask.maxScore ?? 0,
    weight: courseTask.scoreWeight ?? 2,
    donePercent:
      courseTask.score && courseTask.maxScore ? Math.floor((courseTask.score / courseTask.maxScore) * 100) : 0,
  },
});
