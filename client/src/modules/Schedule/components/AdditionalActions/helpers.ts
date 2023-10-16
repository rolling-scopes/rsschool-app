export const buildICalendarLink = (courseId: number, token: string, timezone: string) =>
  `/api/v2/courses/${courseId}/icalendar/${token}?timezone=${encodeURIComponent(timezone || '')}`;

export const buildExportLink = (courseId: number, timezone: string) =>
  `/api/course/${courseId}/schedule/csv/${timezone.replace('/', '_')}`;

export const setExportLink = (link: string) => {
  window.location.href = link;
};
