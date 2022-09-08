import { Alert } from 'antd';
import { CourseDto, CoursesScheduleApi, CoursesScheduleIcalApi, CoursesTasksApi, CreateCourseTaskDto } from 'api';
import { PageLayout } from 'components/PageLayout';
import { isCourseManager } from 'domain/user';
import uniq from 'lodash/uniq';
import { SessionContext } from 'modules/Course/contexts';
import { PageProps } from 'modules/Course/data/getCourseProps';
import { CoursesListModal } from 'modules/CourseManagement/components/CoursesListModal';
import { CourseTaskModal } from 'modules/CourseManagement/components/CourseTaskModal';
import { SettingsPanel } from 'modules/Schedule/components/SettingsPanel';
import { TableView } from 'modules/Schedule/components/TableView';
import { useScheduleSettings } from 'modules/Schedule/hooks/useScheduleSettings';
import { useContext, useMemo, useState } from 'react';
import { useAsyncRetry } from 'react-use';

const courseScheduleApi = new CoursesScheduleApi();
const coursesScheduleIcalApi = new CoursesScheduleIcalApi();

const courseTaskApi = new CoursesTasksApi();

export function SchedulePage(props: PageProps) {
  const session = useContext(SessionContext);
  const [cipher, setCipher] = useState('');
  const [courseTask, setCourseTask] = useState<null | Record<string, any>>(null);
  const [copyModal, setCopyModal] = useState<{ id?: number } | null>(null);
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

  return (
    <PageLayout loading={loading} error={error} title="Schedule" githubId={session.githubId}>
      <SettingsPanel
        onCreateCourseTask={handleCreateCourseTask}
        onCopyFromCourse={() => setCopyModal({})}
        isCourseManager={isManager}
        courseId={props.course.id}
        courseAlias={props.course.alias}
        settings={settings}
        calendarToken={cipher}
        tags={eventTags}
        refreshData={refreshData}
      />
      <TableView settings={settings} data={data} />
      <CourseTaskModal data={courseTask} onSubmit={handleSubmit} onCancel={() => setCourseTask(null)} />
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
  );
}
