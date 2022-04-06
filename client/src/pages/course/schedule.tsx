import moment from 'moment-timezone';
import { useState, useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
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
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { isCourseManager } from 'domain/user';
import { TIMEZONES } from '../../configs/timezones';
import { ViewMode } from 'components/Schedule/constants';
import { ScheduleSettings } from 'components/Schedule/ScheduleSettings';
import { EventModalForm } from 'components/Schedule/EventModalForm';
import { tasksToEvents, parseFiles, uploadResults } from 'components/Schedule/utils';
import useScheduleSettings from 'components/Schedule/useScheduleSettings';

const { Option } = Select;

export function SchedulePage(props: CoursePageProps) {
  const [form] = Form.useForm();
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editableRecord, setEditableRecord] = useState(null);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const isAdmin = useMemo(() => isCourseManager(props.session, props.course.id), [props.session, props.course.id]);
  const settings = useScheduleSettings();

  const loadData = async () => {
    const [courseEvents, courseTasks] = await Promise.all([
      courseService.getCourseEvents(),
      courseService.getCourseTasksForSchedule(),
    ]);
    const events = courseEvents.concat(tasksToEvents(courseTasks)).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    const eventTypes = Array.from(new Set(events.map(({ event }) => event.type)));
    return { events, eventTypes };
  };
  const { retry: refreshData, value: { events = [], eventTypes = [] } = {}, loading } = useAsyncRetry(loadData, [courseService]);

  const filteredEvents = useMemo(() => {
    let filteredData = events.slice(0);
    if (settings.arePassedEventsHidden) {
      const yesterday = moment.utc().subtract(1, 'day');
      filteredData = filteredData.filter(({ dateTime }) => moment(dateTime).isAfter(yesterday, 'day'));
    }
    if (settings.areDoneTasksHidden) {
      filteredData = filteredData.filter(({ done }) => !done || done < settings.limitForDoneTask);
    }
    return filteredData;
  }, [events, settings.arePassedEventsHidden, settings.areDoneTasksHidden, settings.limitForDoneTask]);

  const mapScheduleViewToComponent = {
    [ViewMode.Table]: TableView,
    [ViewMode.List]: ListView,
    [ViewMode.Calendar]: CalendarView,
  };

  const ScheduleView = mapScheduleViewToComponent[settings.viewMode] ?? TableView;

  const togglePassedEventsVisibility = () => settings.setArePassedEventsHidden(!settings.arePassedEventsHidden);
  const toggleDoneTasksVisibility = () => settings.setAreDoneTasksHidden(!settings.areDoneTasksHidden);

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

      refreshData();
    } catch (err) {
      const error = err as Error;
      if (error.message.match(/^Incorrect data/)) {
        message.error(error.message);
      } else {
        message.error('An error occured. Please try later.');
      }
    }
  };

  const onRemove = (_: UploadFile<any>) => setFileList([]);

  const beforeUpload = (file: RcFile) => setFileList([...fileList, file]);

  return (
    <PageLayout loading={loading} title="Schedule" githubId={props.session.githubId}>
      <Row justify="start" gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col>
          <Select style={{ width: 100 }} defaultValue={settings.viewMode} onChange={settings.setViewMode}>
            <Option value={ViewMode.Table}>Table</Option>
            <Option value={ViewMode.List}>List</Option>
            <Option value={ViewMode.Calendar}>Calendar</Option>
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
              onClick={togglePassedEventsVisibility}
              icon={settings.arePassedEventsHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <Tooltip title="Hide done tasks" mouseEnterDelay={1}>
            <Button
              type="primary"
              onClick={toggleDoneTasksVisibility}
              icon={settings.areDoneTasksHidden ? <BorderOutlined /> : <CheckSquareOutlined />}
            />
          </Tooltip>
        </Col>
        <Col>
          <ScheduleSettings eventTypes={eventTypes} settings={settings} />
        </Col>
      </Row>
      <ScheduleView
        data={filteredEvents}
        timeZone={timeZone}
        isAdmin={isAdmin}
        courseId={props.course.id}
        refreshData={refreshData}
        tagColors={settings.tagColors}
        limitForDoneTask={settings.limitForDoneTask}
        alias={props.course.alias}
        columnsShown={settings.columnsHidden}
        settings={settings}
      />
      {isModalOpen && (
        <EventModalForm
          visible={isModalOpen}
          editableRecord={editableRecord}
          handleCancel={closeModal}
          courseId={props.course.id}
          refreshData={refreshData}
        />
      )}
    </PageLayout>
  );
}

export default withCourseData(withSession(SchedulePage));
