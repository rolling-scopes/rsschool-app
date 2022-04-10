import moment from 'moment-timezone';
import { useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { withSession } from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import withCourseData from 'components/withCourseData';
import { CourseEvent, CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager } from 'domain/user';
import { transformTasksToEvents } from 'components/Schedule/utils';
import useScheduleSettings from 'components/Schedule/useScheduleSettings';
import { SettingsPanel } from 'components/Schedule/SettingsPanel';
import { ScheduleView } from 'components/Schedule/ScheduleView';

const byTime = (a: CourseEvent, b: CourseEvent) => a.dateTime.localeCompare(b.dateTime);
const getEventTypes = (events: CourseEvent[]) => Array.from(new Set(events.map(({ event }) => event.type)));
const getYesterday = () => moment.utc().subtract(1, 'day');
const omitDoneTasks = (events: CourseEvent[], limit: number) => events.filter(({ done }) => !done || done < limit);
const omitPassedEvents = (events: CourseEvent[]) =>
  events.filter(({ dateTime }) => moment(dateTime).isAfter(getYesterday(), 'day'));

export function SchedulePage(props: CoursePageProps) {
  const isAdmin = useMemo(() => isCourseManager(props.session, props.course.id), [props.session, props.course.id]);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const settings = useScheduleSettings();

  const loadData = async () => {
    const [courseEvents, courseTasks] = await Promise.all([
      courseService.getCourseEvents(),
      courseService.getCourseTasksForSchedule(),
    ]);
    const events = [...courseEvents, ...transformTasksToEvents(courseTasks)].sort(byTime);
    const eventTypes = getEventTypes(events);
    return { events, eventTypes };
  };
  const {
    retry: refreshData,
    value: { events = [], eventTypes = [] } = {},
    loading,
  } = useAsyncRetry(loadData, [courseService]);

  const filteredEvents = useMemo(() => {
    let filteredEvents = events;
    if (settings.arePassedEventsHidden) filteredEvents = omitPassedEvents(filteredEvents);
    if (settings.areDoneTasksHidden) filteredEvents = omitDoneTasks(filteredEvents, settings.limitForDoneTask);
    return filteredEvents;
  }, [events, settings.arePassedEventsHidden, settings.areDoneTasksHidden, settings.limitForDoneTask]);

  return (
    <PageLayout loading={loading} title="Schedule" githubId={props.session.githubId}>
      <SettingsPanel
        isAdmin={isAdmin}
        courseId={props.course.id}
        settings={settings}
        courseService={courseService}
        eventTypes={eventTypes}
        refreshData={refreshData}
      />
      <ScheduleView
        isAdmin={isAdmin}
        courseId={props.course.id}
        courseAlias={props.course.alias}
        settings={settings}
        data={filteredEvents}
        refreshData={refreshData}
      />
    </PageLayout>
  );
}

export default withCourseData(withSession(SchedulePage));
