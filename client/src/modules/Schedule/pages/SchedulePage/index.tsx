import { Alert, theme } from 'antd';
import {
  CourseDto,
  CourseEventDto,
  CoursesScheduleApi,
  CoursesScheduleIcalApi,
  CoursesTasksApi,
  CreateCourseTaskDto,
} from 'api';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { SessionContext, useActiveCourseContext } from 'modules/Course/contexts';
import { CoursesListModal } from 'modules/CourseManagement/components/CoursesListModal';
import { CourseTaskModal } from 'modules/CourseManagement/components/CourseTaskModal';
import { CourseEventModal } from 'modules/CourseManagement/components/CourseEventModal';
import { SettingsPanel } from 'modules/Schedule/components/SettingsPanel';
import { TableView } from 'modules/Schedule/components/TableView';
import { StatusTabs } from 'modules/Schedule/components/StatusTabs';
import { useScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useContext, useMemo, useState } from 'react';
import { useAsyncRetry, useLocalStorage, useMedia } from 'react-use';
import { ALL_TAB_KEY, LocalStorageKeys } from 'modules/Schedule/constants';

const courseScheduleApi = new CoursesScheduleApi();
const coursesScheduleIcalApi = new CoursesScheduleIcalApi();

const courseTaskApi = new CoursesTasksApi();

export function SchedulePage() {
  const session = useContext(SessionContext);
  const { course } = useActiveCourseContext();

  const mobileView = useMedia('(max-width: 768px)');

  const [cipher, setCipher] = useState('');
  const [courseTask, setCourseTask] = useState<null | Record<string, any>>(null);
  const [courseEvent, setCourseEvent] = useState<Partial<CourseEventDto> | null>(null);
  const [copyModal, setCopyModal] = useState<{ id?: number } | null>(null);
  const [selectedTab, setSelectedTab] = useLocalStorage<string>(LocalStorageKeys.StatusFilter, ALL_TAB_KEY);
  const isManager = useMemo(() => isCourseManager(session, course.id), [session, course.id]);
  const settings = useScheduleSettings();

  const handleSubmit = async (record: CreateCourseTaskDto) => {
    await courseTaskApi.createCourseTask(course.id, record);
    setCourseTask(null);
    refreshData();
  };

  const handleEventSubmit = () => {
    setCourseEvent(null);
    refreshData();
  };

  const handleCopyFromSubmit = async (record: Pick<CourseDto, 'id'>) => {
    await courseScheduleApi.copySchedule(course.id, { copyFromCourseId: record.id });
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
      courseScheduleApi.getSchedule(course.id),
      coursesScheduleIcalApi.getScheduleICalendarToken(course.id),
    ]);
    setCipher(tokenResponse.data.token);
    return response.data ?? [];
  }, [course.id]);

  const eventTags = useMemo(() => uniq(data.map(item => item.tag)), [data]);
  const statuses = useMemo(() => data.map(({ status }) => status), [data]);

  const { token } = theme.useToken();

  return (
    <>
      <PageLayout loading={loading} error={error} title="Schedule" showCourseName background={token.colorBgLayout}>
        <StatusTabs activeTab={selectedTab} statuses={statuses} onTabChange={setSelectedTab} mobileView={mobileView}>
          {!mobileView && (
            <SettingsPanel
              onCreateCourseTask={handleCreateCourseTask}
              onCreateCourseEvent={handleCreateCourseEvent}
              onCopyFromCourse={() => setCopyModal({})}
              isCourseManager={isManager}
              courseId={course.id}
              courseAlias={course.alias}
              settings={settings}
              calendarToken={cipher}
              tags={eventTags}
              refreshData={refreshData}
              mobileView={mobileView}
            />
          )}
        </StatusTabs>

        <TableView settings={settings} data={data} statusFilter={selectedTab} mobileView={mobileView} />

        {courseTask ? (
          <CourseTaskModal data={courseTask} onSubmit={handleSubmit} onCancel={() => setCourseTask(null)} />
        ) : null}
        {courseEvent && (
          <CourseEventModal
            data={courseEvent}
            onSubmit={handleEventSubmit}
            onCancel={() => setCourseEvent(null)}
            courseId={course.id}
          />
        )}
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
      {!mobileView && (
        <style jsx>
          {`
            :global(.ant-layout-content) {
              margin: 16px 0 0 !important;
              padding: 0 24px 24px;
            }
          `}
        </style>
      )}
    </>
  );
}
