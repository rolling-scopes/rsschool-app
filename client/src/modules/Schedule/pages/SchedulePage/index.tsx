import { Alert } from 'antd';
import { CourseDto, CoursesScheduleApi, CoursesScheduleIcalApi, CoursesTasksApi, CreateCourseTaskDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { SessionContext } from 'modules/Course/contexts';
import { PageProps } from 'modules/Course/data/getCourseProps';
import { CoursesListModal } from 'modules/CourseManagement/components/CoursesListModal';
import { CourseTaskModal } from 'modules/CourseManagement/components/CourseTaskModal';
import { CourseEventModal } from 'modules/CourseManagement/components/CourseEventModal';
import { SettingsPanel } from 'modules/Schedule/components/SettingsPanel';
import { TableView } from 'modules/Schedule/components/TableView';
import { StatusTabs } from 'modules/Schedule/components/StatusTabs';
import { useScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useContext, useMemo, useState } from 'react';
import { useAsyncRetry, useLocalStorage } from 'react-use';
import { ALL_TAB_KEY, LocalStorageKeys } from 'modules/Schedule/constants';

const courseScheduleApi = new CoursesScheduleApi();
const coursesScheduleIcalApi = new CoursesScheduleIcalApi();

const courseTaskApi = new CoursesTasksApi();

export function SchedulePage(props: PageProps) {
  const session = useContext(SessionContext);
  const [cipher, setCipher] = useState('');
  const [courseTask, setCourseTask] = useState<null | Record<string, any>>(null);
  const [courseEvent, setCourseEvent] = useState<null | Record<string, any>>(null);
  const [copyModal, setCopyModal] = useState<{ id?: number } | null>(null);
  const [selectedTab, setSelectedTab] = useLocalStorage<string>(LocalStorageKeys.StatusFilter, ALL_TAB_KEY);
  const isManager = useMemo(() => isCourseManager(session, props.course.id), [session, props.course.id]);
  const settings = useScheduleSettings();

  const handleSubmit = async (record: CreateCourseTaskDto) => {
    await courseTaskApi.createCourseTask(props.course.id, record);
    setCourseTask(null);
    refreshData();
  };

  const handleCopyFromSubmit = async (record: Pick<CourseDto, 'id'>) => {
    await courseScheduleApi.copySchedule(props.course.id, { copyFromCourseId: record.id });
    setCopyModal(null);
    refreshData();
  };

  const handleCreateCourseTask = () => {
    setCourseTask({});
  };

  const handleCreateCourseEvent = () => {
    setCourseEvent({});
  };

  const {
    retry: refreshData,
    value: data = [],
    loading,
    error,
  } = useAsyncRetry(async () => {
    const [response, tokenResponse] = await Promise.all([
      courseScheduleApi.getSchedule(props.course.id),
      coursesScheduleIcalApi.getScheduleICalendarToken(props.course.id),
    ]);
    setCipher(tokenResponse.data.token);
    return response.data ?? [];
  }, [props.course.id]);

  const eventTags = useMemo(() => uniq(data.map(item => item.tag)), [data]);
  const statuses = useMemo(() => data.map(({ status }) => status), [data]);

  return (
    <>
      <PageLayout loading={loading} error={error} title="Schedule" githubId={session.githubId}>
        <StatusTabs activeTab={selectedTab} statuses={statuses} onTabChange={setSelectedTab}>
          <SettingsPanel
            onCreateCourseTask={handleCreateCourseTask}
            onCreateCourseEvent={handleCreateCourseEvent}
            onCopyFromCourse={() => setCopyModal({})}
            isCourseManager={isManager}
            courseId={props.course.id}
            courseAlias={props.course.alias}
            settings={settings}
            calendarToken={cipher}
            tags={eventTags}
            refreshData={refreshData}
          />
        </StatusTabs>
        <TableView settings={settings} data={data} statusFilter={selectedTab} />
        <CourseTaskModal data={courseTask} onSubmit={handleSubmit} onCancel={() => setCourseTask(null)} />
        <CourseEventModal data={courseEvent} onCancel={() => setCourseEvent(null)} courseId={props.course.id} />
        <CoursesListModal
          okText="Copy"
          data={copyModal}
          onSubmit={handleCopyFromSubmit}
          onCancel={() => setCopyModal(null)}
        >
          <Alert
            style={{ marginBottom: 16 }}
            type="error"
            description="It will copy all tasks and events from selected couse to your course. The action is not reversible."
          />
        </CoursesListModal>
      </PageLayout>
      <style jsx>
        {`
          :global(.ant-layout-content) {
            background-color: #f0f2f5;
            margin: 16px 0 0 !important;
            padding: 0 24px 24px;
          }
        `}
      </style>
    </>
  );
}
