import { CoursesScheduleApi } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SettingsPanel, TableView, useScheduleSettings } from 'components/Schedule';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components/withSession';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';

const courseScheduleApi = new CoursesScheduleApi();

export function SchedulePage(props: CoursePageProps) {
  const isAdmin = useMemo(() => isCourseManager(props.session, props.course.id), [props.session, props.course.id]);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const settings = useScheduleSettings();

  const loadData = async () => {
    const courseSchedule = await courseScheduleApi.getSchedule(props.course.id);
    return courseSchedule;
  };

  const { retry: refreshData, value: { data = [] } = {}, loading, error } = useAsyncRetry(loadData, [props.course.id]);

  const eventTypes = useMemo(() => uniq(data.map(item => item.tags).flat()), [data]);
  const filteredEvents = useMemo(() => {
    return data;
  }, [data]);

  return (
    <PageLayout loading={loading} error={error} title="Schedule" githubId={props.session.githubId}>
      <SettingsPanel
        isAdmin={isAdmin}
        courseId={props.course.id}
        settings={settings}
        courseService={courseService}
        eventTypes={eventTypes}
        refreshData={refreshData}
      />
      <TableView
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
