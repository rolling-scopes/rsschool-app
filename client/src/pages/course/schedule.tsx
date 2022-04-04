import { useState, useMemo } from 'react';
import { useAsync, useLocalStorage } from 'react-use';
import { Col, Row, Select, Tooltip, Button, Form, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { RcFile } from 'antd/lib/upload';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  CheckSquareOutlined,
  BorderOutlined,
} from '@ant-design/icons';
import { withSession } from 'components/withSession';
import { PageLayout } from 'components/PageLayout';
import { TableView, CalendarView, ListView } from 'components/Schedule';
import withCourseData from 'components/withCourseData';
import { CourseEvent, CourseService, CourseTask, CourseTaskDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager } from 'domain/user';
import { TIMEZONES } from '../../configs/timezones';
import { isMobileOnly } from 'mobile-device-detect';
import { ViewMode, SPECIAL_TASK_TYPES, Column, CONFIGURABLE_COLUMNS } from 'components/Schedule/model';
import ScheduleSettings from 'components/Schedule/ScheduleSettings/ScheduleSettings';
import { DEFAULT_COLORS } from 'components/Schedule/ScheduleSettings/scheduleSettingsHandlers';
import ModalFormEntity from '../../components/Schedule/ModalFormEntity';
import moment from 'moment-timezone';
import { isUndefined } from 'lodash';
import csv from 'csvtojson';

const { Option } = Select;
const LOCAL_VIEW_MODE = 'scheduleViewMode';
const TAG_COLORS = 'tagColors';
const LOCAL_HIDE_OLD_EVENTS = 'scheduleHideOldEvents';
const LOCAL_HIDE_DONE_TASKS = 'scheduleHideDoneTasks';
const LIMIT_FOR_DONE_TASKS = 'scheduleLimitForDoneTask';
const COLUMNS_SHOWN = 'scheduleColumnsShown';
const EVENT_TYPES_SHOWN = 'eventTypesShown';
const SPLITTED_BY_WEEK = 'scheduleSplitedByWeek';

export function SchedulePage(props: CoursePageProps) {
  const [form] = Form.useForm();
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [scheduleViewMode, setScheduleViewMode] = useLocalStorage<string>(LOCAL_VIEW_MODE, getDefaultViewMode());
  const [isOldEventsHidden, setOldEventsHidden] = useLocalStorage<boolean>(LOCAL_HIDE_OLD_EVENTS, false);
  const [isDoneTasksHidden, setDoneTasksHidden] = useLocalStorage<boolean>(LOCAL_HIDE_DONE_TASKS, false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const isAdmin = useMemo(() => isCourseManager(props.session, props.course.id), [props.session, props.course.id]);

  const [splittedByWeek = false, setSplittedByWeek] = useLocalStorage<boolean>(SPLITTED_BY_WEEK, false);
  const [eventTypesHidden = [], setEventTypesHidden] = useLocalStorage<string[]>(EVENT_TYPES_SHOWN, []);
  const [columnsShown = [], setColumnsShown] = useLocalStorage<string[]>(COLUMNS_SHOWN, CONFIGURABLE_COLUMNS);
  const [eventTypeTagsColors = [], setEventTypeTagsColors] = useLocalStorage<object>(TAG_COLORS, DEFAULT_COLORS);
  const [limitForDoneTask = 100, setLimitForDoneTask] = useLocalStorage<number>(LIMIT_FOR_DONE_TASKS, 100);
  const settings = {
    splittedByWeek,
    setSplittedByWeek,
    eventTypesHidden,
    setEventTypesHidden,
    columnsShown,
    setColumnsShown,
    eventTypeTagsColors,
    setEventTypeTagsColors,
    limitForDoneTask,
    setLimitForDoneTask,
  };

  const loadData = async () => {
    const [courseEvents, courseTasks] = await Promise.all([
      courseService.getCourseEvents(),
      courseService.getCourseTasksForSchedule(),
    ]);
    const events = courseEvents.concat(tasksToEvents(courseTasks)).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    const eventTypes = Array.from(new Set(events.map(({ event }) => event.type)));
    return { events, eventTypes };
  };
  const { value: { events = [], eventTypes = [] } = {}, loading } = useAsync(loadData, [courseService]);

  const filteredEvents = useMemo(() => {
    let filteredData = events.slice(0);
    if (isOldEventsHidden) {
      const yesterday = moment.utc().subtract(1, 'day');
      filteredData = filteredData.filter(({ dateTime }) => moment(dateTime).isAfter(yesterday, 'day'));
    }
    if (isDoneTasksHidden && limitForDoneTask !== undefined) {
      filteredData = filteredData.filter(({ done }) => !done || done < limitForDoneTask);
    }
    return filteredData;
  }, [events, isOldEventsHidden, isDoneTasksHidden]);

  const mapScheduleViewToComponent = {
    [ViewMode.TABLE]: TableView,
    [ViewMode.LIST]: ListView,
    [ViewMode.CALENDAR]: CalendarView,
  };

  const viewMode = scheduleViewMode as ViewMode;
  const ScheduleView = mapScheduleViewToComponent[viewMode] || TableView;

  const toggleOldEvents = () => {
    setOldEventsHidden(!isOldEventsHidden);
  };

  const toggleDoneTasks = () => {
    setDoneTasksHidden(!isDoneTasksHidden);
  };

  const closeModal = async () => {
    setEditableRecord(null);
    setModalOpen(false);
  };

  const exportToCsv = () => {
    window.location.href = `/api/course/${props.course.id}/schedule/csv/${timeZone.replace('/', '_')}`;
  };

  const handleSubmit = async (values: any) => {
    try {
      const results = await parseFiles(values.files);
      const submitResults = await uploadResults(courseService, results, timeZone);

      if (submitResults.toString().includes('successfully')) {
        message.success(submitResults);
        setFileList([]);
      } else {
        message.error(submitResults);
      }

      await loadData();
    } catch (err) {
      const error = err as Error;
      if (error.message.match(/^Incorrect data/)) {
        message.error(error.message);
      } else {
        message.error('An error occured. Please try later.');
      }
    }
  };

  const onRemove = (_: UploadFile<any>) => {
    setFileList([]);
  };

  const beforeUpload = (file: RcFile) => {
    setFileList([...fileList, file]);

    return false;
  };

  return (
    <PageLayout loading={loading} title="Schedule" githubId={props.session.githubId}>
      <Row justify="start" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col>
          <Select style={{ width: 100 }} defaultValue={scheduleViewMode} onChange={setScheduleViewMode}>
            <Option value={ViewMode.TABLE}>Table</Option>
            <Option value={ViewMode.LIST}>List</Option>
            <Option value={ViewMode.CALENDAR}>Calendar</Option>
          </Select>
        </Col>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Please select a timezone"
            defaultValue={timeZone}
            onChange={setTimeZone}
          >
            {TIMEZONES.map(tz => (
              <Option key={tz} value={tz}>
                {/* there is no 'Europe / Kyiv' time zone at the moment */}
                {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
              </Option>
            ))}
          </Select>
        </Col>
        {isAdmin && (
          <>
            <Col>
              <Tooltip title="Export schedule" mouseEnterDelay={1}>
                <Button onClick={exportToCsv} icon={<DownloadOutlined />} />
              </Tooltip>
            </Col>
            <Form form={form} onFinish={handleSubmit} layout="inline">
              <Col>
                <Form.Item label="" name="files" rules={[{ required: true, message: 'Please select csv-file' }]}>
                  <Upload onRemove={onRemove} beforeUpload={beforeUpload} fileList={fileList}>
                    <Tooltip title="Import schedule" mouseEnterDelay={1}>
                      <Button icon={<UploadOutlined />} />
                    </Tooltip>
                  </Upload>
                </Form.Item>
              </Col>
              {fileList.length > 0 && (
                <Col>
                  <Button type="primary" htmlType="submit" style={{ marginRight: '1.5em' }}>
                    Import CSV
                  </Button>
                </Col>
              )}
            </Form>
            <Col>
              <Tooltip title="Add new" mouseEnterDelay={1}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setModalOpen(true);
                  }}
                />
              </Tooltip>
            </Col>
          </>
        )}
        <Col>
          <Tooltip title="Hide old events" mouseEnterDelay={1}>
            <Button
              type="primary"
              onClick={toggleOldEvents}
              icon={isOldEventsHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Hide done tasks" mouseEnterDelay={1}>
            <Button
              type="primary"
              onClick={toggleDoneTasks}
              icon={isDoneTasksHidden ? <BorderOutlined /> : <CheckSquareOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <ScheduleSettings
            eventTypes={eventTypes}
            settings={settings}
          />
        </Col>
      </Row>
      <ScheduleView
        data={filteredEvents}
        timeZone={timeZone}
        isAdmin={isAdmin}
        courseId={props.course.id}
        refreshData={loadData}
        storedTagColors={eventTypeTagsColors}
        limitForDoneTask={limitForDoneTask}
        alias={props.course.alias}
        columnsShown={columnsShown}
        settings={settings}
      />
      {isModalOpen && (
        <ModalFormEntity
          visible={isModalOpen}
          editableRecord={editableRecord}
          handleCancel={closeModal}
          courseId={props.course.id}
          refreshData={loadData}
        />
      )}
    </PageLayout>
  );
}

const tasksToEvents = (tasks: CourseTaskDetails[]) => {
  return tasks.reduce((acc: Array<CourseEvent>, task: CourseTaskDetails) => {
    if (task.type !== SPECIAL_TASK_TYPES.test) {
      acc.push(createCourseEventFromTask(task, task.type));
    }
    acc.push(
      createCourseEventFromTask(
        task,
        task.type === SPECIAL_TASK_TYPES.test ? SPECIAL_TASK_TYPES.test : SPECIAL_TASK_TYPES.deadline,
      ),
    );
    return acc;
  }, []);
};

const createCourseEventFromTask = (task: CourseTaskDetails, type: string): CourseEvent => {
  return {
    id: task.id,
    dateTime: (type === SPECIAL_TASK_TYPES.deadline ? task.studentEndDate : task.studentStartDate) || '',
    event: {
      type: type,
      name: task.name,
      descriptionUrl: task.descriptionUrl,
      id: task.taskId,
    },
    organizer: {
      githubId: task.taskOwner ? task.taskOwner.githubId : '',
    },
    isTask: true,
    special: task.special,
    duration: task.duration,
    score: `${task.score ?? 0}/${task.maxScore}`,
    done: task.score && task.maxScore ? Math.round((task.score / task.maxScore) * 100) : 0,
  } as CourseEvent;
};

const getDefaultViewMode = () => {
  const localView = localStorage.getItem(LOCAL_VIEW_MODE);

  if (localView) {
    return localView;
  }

  if (isMobileOnly) {
    return ViewMode.LIST;
  }

  return ViewMode.TABLE;
};

const parseFiles = async (incomingFiles: any) => {
  const files = incomingFiles.fileList;
  const filesContent: string[] = await Promise.all(
    files.map(
      (file: any) =>
        new Promise((res, rej) => {
          const reader = new FileReader();
          reader.readAsText(file.originFileObj, 'utf-8');
          reader.onload = ({ target }) => res(target ? target.result : '');
          reader.onerror = e => rej(e);
        }),
    ),
  );

  const entities = (await Promise.all(filesContent.map((content: string) => csv().fromString(content))))
    .reduce((acc, cur) => acc.concat(cur), [])
    .map((item: any) => {
      if (isUndefined(item.entityType)) {
        throw new Error('Incorrect data: CSV file should content the headers named "entityType"');
      }
      return {
        entityType: item.entityType as string,
        templateId: item.templateId as string,
        id: item.id as string,
        startDate: item.startDate as string,
        endDate: item.endDate as string,
        type: item.type as string,
        special: item.special as string,
        name: item.name as string,
        descriptionUrl: item.descriptionUrl as string,
        githubId: item.githubId as string,
        place: item.place as string,
        checker: item.checker as string,
        pairsCount: item.pairsCount as string,
      };
    });

  return entities;
};

const uploadResults = async (
  courseService: CourseService,
  data: {
    entityType: string;
    id: string;
    startDate: string;
    endDate: string;
    type: string;
    special: string;
    name: string;
    descriptionUrl: string;
    githubId: string;
    place: string;
  }[],
  timeZone: string,
) => {
  const resultsNewTasks = await courseService.postMultipleEntities(data as Partial<CourseEvent & CourseTask>, timeZone);

  return resultsNewTasks;
};

export default withCourseData(withSession(SchedulePage));
