import { Button, DatePicker, Form, Input, message, Popconfirm, Select, Table } from 'antd';
import { GithubUserLink, UserSearch, withSession, PageLayout } from 'components';
import { CommentInput, ModalForm } from 'components/Forms';
import { dateRenderer, idFromArrayRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseEvent, CourseService } from 'services/course';
import { Event, EventService } from 'services/event';
import { formatTimezoneToUTC } from 'services/formatter';
import { CoursePageProps } from 'services/models';
import { Stage, StageService } from 'services/stage';
import { UserService } from 'services/user';
import { urlPattern } from 'services/validators';
import { DEFAULT_TIMEZONE, TIMEZONES } from '../../../configs/timezones';

type Props = CoursePageProps;

const timeZoneRenderer = (timeZone: string) => (value: string) => {
  return value
    ? moment(value, 'YYYY-MM-DD HH:mmZ')
        .tz(timeZone)
        .format('HH:mm')
    : '';
};

function Page(props: Props) {
  const courseId = props.course.id;
  const [timeZone, setTimeZone] = useState(DEFAULT_TIMEZONE);
  const userService = new UserService();
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as CourseEvent[]);
  const [stages, setStages] = useState([] as Stage[]);
  const [events, setEvents] = useState([] as Event[]);
  const [modalData, setModalData] = useState(null as Partial<CourseEvent> | null);
  const [modalAction, setModalAction] = useState('update');
  const [modalLoading, setModalLoading] = useState(false);

  useAsync(async () => {
    setLoading(true);
    const [data, stages, events] = await Promise.all([
      service.getCourseEvents(),
      new StageService().getCourseStages(courseId),
      new EventService().getEvents(),
    ]);
    setData(data);
    setStages(stages);
    setEvents(events);
    setLoading(false);
  }, [courseId]);

  const handleTimeZoneChange = (timeZone: string) => {
    setTimeZone(timeZone);
  };

  const refreshData = async () => {
    const data = await service.getCourseEvents();
    setData(data);
  };

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const handleAddItem = () => {
    setModalData({});
    setModalAction('create');
  };

  const handleEditItem = (record: CourseEvent) => {
    setModalData(record);
    setModalAction('update');
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await service.deleteCourseEvent(id);
      await refreshData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleModalSubmit = async (values: any) => {
    try {
      setModalLoading(true);
      const data = createRecord(values, courseId);
      modalAction === 'update'
        ? await service.updateCourseEvent(modalData!.id!, data)
        : await service.createCourseEvent(data);

      await refreshData();
      setModalData(null);
    } catch {
      message.error('An error occurred. Please try later.');
    } finally {
      setModalLoading(false);
    }
  };

  const renderModal = (modalData: Partial<CourseEvent> | null) => {
    return (
      <ModalForm
        getInitialValues={getInitialValues}
        data={modalData}
        title="Course Event"
        submit={handleModalSubmit}
        loading={modalLoading}
        cancel={() => setModalData(null)}
      >
        <Form.Item name="eventId" label="Event" rules={[{ required: true, message: 'Please select an event' }]}>
          <Select placeholder="Please select an event">
            {events.map(event => (
              <Select.Option key={event.id} value={event.id}>
                {event.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="stageId" label="Stage" rules={[{ required: true, message: 'Please select a stage' }]}>
          <Select placeholder="Please select a stage">
            {stages.map((stage: Stage) => (
              <Select.Option key={stage.id} value={stage.id}>
                {stage.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="timeZone" label="TimeZone">
          <Select placeholder="Please select a timezone">
            {TIMEZONES.map(tz => (
              <Select.Option key={tz} value={tz}>
                {tz}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="dateTime"
          label="Date and Time"
          rules={[{ required: true, message: 'Please enter date and time' }]}
        >
          <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} />
        </Form.Item>
        <Form.Item name="place" label="Place">
          <Input />
        </Form.Item>
        <Form.Item name="organizerId" label="Organizer">
          <UserSearch defaultValues={modalData?.organizer ? [modalData.organizer] : []} searchFn={loadUsers} />
        </Form.Item>
        <Form.Item
          name="broadcastUrl"
          label="Broadcast URL"
          rules={[{ pattern: urlPattern, message: 'Enter valid url' }]}
        >
          <Input />
        </Form.Item>
        <CommentInput notRequired />
      </ModalForm>
    );
  };

  return (
    <PageLayout loading={loading} githubId={props.session.githubId}>
      <Button type="primary" onClick={handleAddItem}>
        Add Event
      </Button>
      <Select
        style={{ marginLeft: 16 }}
        placeholder="Please select a timezone"
        defaultValue={timeZone}
        onChange={handleTimeZoneChange}
      >
        {TIMEZONES.map(tz => (
          <Select.Option key={tz} value={tz}>
            {tz}
          </Select.Option>
        ))}
      </Select>
      <Table
        style={{ margin: '16px 0' }}
        rowKey="id"
        bordered
        pagination={false}
        size="small"
        dataSource={data}
        columns={getColumns(handleEditItem, handleDeleteItem, { timeZone, events, stages })}
      />
      {renderModal(modalData!)}
    </PageLayout>
  );
}

export default withCourseData(withSession(Page));

function getColumns(handleEditItem: any, handleDeleteItem: any, { timeZone, events, stages }: any) {
  return [
    { title: 'Id', dataIndex: 'id' },
    {
      title: 'Name',
      dataIndex: 'eventId',
      render: idFromArrayRenderer(events),
    },
    { title: 'Type', dataIndex: ['event', 'type'] },
    { title: 'Date', dataIndex: 'dateTime', render: dateRenderer, width: 100 },
    { title: 'Time', dataIndex: 'dateTime', render: timeZoneRenderer(timeZone), width: 60 },
    { title: 'Place', dataIndex: 'place' },
    {
      title: 'Organizer',
      dataIndex: ['organizer', 'githubId'],
      render: (value: string) => (value ? <GithubUserLink value={value} /> : ''),
    },
    { title: 'Comment', dataIndex: 'comment' },
    {
      title: 'Stage',
      dataIndex: 'stageId',
      width: 70,
      render: idFromArrayRenderer(stages),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: 110,
      render: (_: any, record: CourseEvent) => (
        <>
          <span>
            <a onClick={() => handleEditItem(record)}>Edit</a>{' '}
          </span>
          <span style={{ marginLeft: 8 }}>
            <Popconfirm
              onConfirm={() => handleDeleteItem(record.id)}
              title="Are you sure you want to delete this item?"
            >
              <a href="#">Delete</a>
            </Popconfirm>
          </span>
        </>
      ),
    },
  ];
}

function createRecord(values: any, courseId: number) {
  const data = {
    courseId,
    place: values.place,
    dateTime: values.dateTime ? formatTimezoneToUTC(values.dateTime, values.timeZone) : undefined,
    eventId: values.eventId,
    stageId: values.stageId,
    comment: values.comment,

    coordinator: values.coordinator,
    organizerId: values.organizerId,
    broadcastUrl: values.broadcastUrl,
  };
  return data;
}

function getInitialValues(modalData: Partial<CourseEvent>) {
  return {
    ...modalData,
    dateTime: modalData.dateTime ? moment.tz(modalData.dateTime, DEFAULT_TIMEZONE) : null,
    timeZone: DEFAULT_TIMEZONE,
  };
}
