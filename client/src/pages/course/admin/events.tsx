import { Button, message, Popconfirm, Select, Table } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { GithubUserLink } from 'components/GithubUserLink';
import { AdminPageLayout } from 'components/PageLayout';
import { dateRenderer, idFromArrayRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import { CourseEvent, CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { ALL_TIMEZONES } from '../../../configs/timezones';
import { CourseEventModal } from 'modules/CourseManagement/components/CourseEventModal';
import { EventDto, EventsApi } from 'api';

import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { SessionAndCourseProvider } from 'modules/Course/contexts';

dayjs.extend(utc);
dayjs.extend(tz);

type Props = CoursePageProps;

const timeZoneRenderer = (timeZone: string) => (value: string) => {
  return value ? dayjs(value, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('HH:mm') : '';
};

const eventsApi = new EventsApi();

function CourseEventPage(props: Props) {
  const courseId = props.course.id;
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [modalData, setModalData] = useState<Partial<CourseEvent> | null>(null);
  const service = useMemo(() => new CourseService(courseId), [courseId]);
  const [data, setData] = useState([] as CourseEvent[]);
  const [events, setEvents] = useState<EventDto[]>([]);

  const { loading } = useAsync(async () => {
    const [data, { data: events }] = await Promise.all([service.getCourseEvents(), eventsApi.getEvents()]);
    setData(data);
    setEvents(events);
  }, [courseId]);

  const handleTimeZoneChange = (timeZone: string) => {
    setTimeZone(timeZone);
  };

  const refreshData = async () => {
    const data = await service.getCourseEvents();
    setData(data);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await service.deleteCourseEvent(id);
      await refreshData();
    } catch {
      message.error('Failed to delete item. Please try later.');
    }
  };

  const handleAddEvent = () => {
    setModalData({});
  };

  const handleEditEvent = (event: Partial<CourseEvent>) => {
    setModalData(event);
  };

  const handleEventSubmit = async () => {
    setModalData(null);
    refreshData();
  };

  return (
    <AdminPageLayout loading={loading} courses={[props.course]}>
      <Button type="primary" onClick={handleAddEvent}>
        Add Event
      </Button>
      <Select
        style={{ marginLeft: 16 }}
        placeholder="Please select a timezone"
        defaultValue={timeZone}
        onChange={handleTimeZoneChange}
      >
        {ALL_TIMEZONES.map(tz => (
          <Select.Option key={tz} value={tz}>
            {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
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
        columns={getColumns(handleEditEvent, handleDeleteItem, { timeZone, events })}
      />
      {modalData && (
        <CourseEventModal
          data={modalData}
          onSubmit={handleEventSubmit}
          onCancel={() => setModalData(null)}
          courseId={courseId}
        />
      )}
    </AdminPageLayout>
  );
}

function getColumns(
  handleEditItem: (event: Partial<CourseEvent>) => void,
  handleDeleteItem: any,
  { timeZone, events }: any,
) {
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
    { title: 'End Date', dataIndex: 'endTime', render: dateRenderer },
    { title: 'Place', dataIndex: 'place' },
    {
      title: 'Organizer',
      dataIndex: ['organizer', 'githubId'],
      render: (value: string) => (value ? <GithubUserLink value={value} /> : ''),
    },
    { title: 'Comment', dataIndex: 'comment' },
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

function Page(props: CoursePageProps) {
  return (
    <SessionAndCourseProvider course={props.course}>
      <CourseEventPage {...props} />
    </SessionAndCourseProvider>
  );
}

export default withCourseData(withSession(Page));
