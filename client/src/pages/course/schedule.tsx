import { CoursesScheduleApi } from 'api';
import { PageLayout } from 'components/PageLayout';
import { SettingsPanel, TableView, useScheduleSettings } from 'components/Schedule';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components/withSession';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { CoursePageProps } from 'services/models';

const courseScheduleApi = new CoursesScheduleApi();

export function SchedulePage(props: CoursePageProps) {
  const isManager = useMemo(() => isCourseManager(props.session, props.course.id), [props.session, props.course.id]);
  const settings = useScheduleSettings();

  const loadData = async () => {
    const response = await courseScheduleApi.getSchedule(props.course.id);
    return response;
  };

  const { retry: refreshData, value: { data = [] } = {}, loading, error } = useAsyncRetry(loadData, [props.course.id]);
  const eventTags = useMemo(() => uniq(data.map(item => item.tags).flat()), [data]);

  return (
    <PageLayout loading={loading} error={error} title="Schedule" githubId={props.session.githubId}>
      <SettingsPanel
        isCourseManager={isManager}
        courseId={props.course.id}
        settings={settings}
        eventTypes={eventTags}
        refreshData={refreshData}
      />
      <TableView settings={settings} data={data} />
    </PageLayout>
  );
}

export default withCourseData(withSession(SchedulePage));
