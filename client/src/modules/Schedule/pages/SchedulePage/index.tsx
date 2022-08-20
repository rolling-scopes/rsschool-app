import { CoursesScheduleApi } from 'api';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { SessionContext } from 'modules/Course/contexts';
import { PageProps } from 'modules/Course/data/getCourseProps';
import { SettingsPanel } from 'modules/Schedule/components/SettingsPanel';
import { TableView } from 'modules/Schedule/components/TableView';
import { useScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useContext, useMemo } from 'react';
import { useAsyncRetry } from 'react-use';

const courseScheduleApi = new CoursesScheduleApi();

export function SchedulePage(props: PageProps) {
  const session = useContext(SessionContext);
  const isManager = useMemo(() => isCourseManager(session, props.course.id), [session, props.course.id]);
  const settings = useScheduleSettings();

  const {
    retry: refreshData,
    value: data = [],
    loading,
    error,
  } = useAsyncRetry(async () => {
    const response = await courseScheduleApi.getSchedule(props.course.id);
    return response.data ?? [];
  }, [props.course.id]);
  const eventTags = useMemo(() => uniq(data.map(item => item.tags).flat()), [data]);

  return (
    <PageLayout loading={loading} error={error} title="Schedule" githubId={session.githubId}>
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
