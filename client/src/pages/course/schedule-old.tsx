import { QuestionCircleOutlined, YoutubeOutlined } from '@ant-design/icons';
import { Row, Select, Table, Tag, Tooltip } from 'antd';
import { GithubUserLink } from 'components/GithubUserLink';
import { PageLayout } from 'components/PageLayout';
import { useLoading } from 'components/useLoading';
import withCourseData from 'components/withCourseData';
import withSession from 'components/withSession';
import moment from 'moment-timezone';
import { useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { CourseEvent, CourseService, CourseTaskDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { TIMEZONES } from '../../configs/timezones';

enum EventTypeColor {
  deadline = '#ff0000',
  test = '#63ab91',
  jstask = 'green',
  htmltask = 'green',
  selfeducation = 'green',
  externaltask = 'green',
  codewars = 'green',
  codejam = 'green',
  newtask = 'green',
  lecture = 'blue',
  lecture_online = 'blue',
  lecture_offline = 'blue',
  lecture_mixed = 'blue',
  lecture_self_study = 'blue',
  info = '#ff7b00',
  warmup = '#63ab91',
  meetup = '#bde04a',
  workshop = '#bde04a',
  interview = '#63ab91',
  'Cross-Check deadline' = '#ff0000',
}

const TaskTypes = {
  deadline: 'deadline',
  test: 'test',
  newtask: 'newtask',
  lecture: 'lecture',
};

const EventTypeToName: Record<string, string> = {
  lecture_online: 'online lecture',
  lecture_offline: 'offline lecture',
  lecture_mixed: 'mixed lecture',
  lecture_self_study: 'self study',
  warmup: 'warm-up',
  jstask: 'js task',
  kotlintask: 'kotlin task',
  objctask: 'objc task',
  htmltask: 'html task',
  codejam: 'code jam',
  externaltask: 'external task',
  codewars: 'codewars',
  selfeducation: 'self education',
};

export function SchedulePage(props: CoursePageProps) {
  const [loading, withLoading] = useLoading(false);
  const [data, setData] = useState<CourseEvent[]>([]);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);
  const startOfToday = moment().startOf('day');

  useAsync(
    withLoading(async () => {
      const [events, tasks] = await Promise.all([
        courseService.getCourseEvents(),
        courseService.getCourseTasksDetails(),
      ]);
      const data = events.concat(tasksToEvents(tasks)).sort((a, b) => a.dateTime.localeCompare(b.dateTime));
      setData(data);
    }),
    [courseService],
  );

  return (
    <PageLayout loading={loading} title="Schedule" githubId={props.session.githubId}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Please select a timezone"
          defaultValue={timeZone}
          onChange={setTimeZone}
        >
          {TIMEZONES.map(tz => (
            <Select.Option key={tz} value={tz}>
              {/* there is no 'Europe / Kyiv' time zone at the moment */}
              {tz === 'Europe/Kiev' ? 'Europe/Kyiv' : tz}
            </Select.Option>
          ))}
        </Select>
      </Row>
      <Table
        rowKey={record => (record.event.type === TaskTypes.deadline ? `${record.id}d` : record.id).toString()}
        pagination={false}
        size="small"
        dataSource={data}
        rowClassName={record => (moment(record.dateTime).isBefore(startOfToday) ? 'rs-table-row-disabled' : '')}
        columns={[
          { title: 'Date', width: 120, dataIndex: 'dateTime', render: dateRenderer(timeZone) },
          { title: 'Time', width: 60, dataIndex: 'dateTime', render: timeRenderer(timeZone) },
          {
            title: 'Type',
            width: 100,
            dataIndex: ['event', 'type'],
            render: (value: keyof typeof EventTypeColor) => (
              <Tag color={EventTypeColor[value]}>{EventTypeToName[value] || value}</Tag>
            ),
          },
          {
            title: 'Place',
            dataIndex: 'place',
            render: (value: string) => {
              return value === 'Youtube Live' ? (
                <div>
                  <YoutubeOutlined /> {value}{' '}
                  <Tooltip title="Ссылка будет в Discord">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </div>
              ) : (
                value
              );
            },
          },
          {
            title: 'Name',
            dataIndex: ['event', 'name'],
            render: (value: string, record) => {
              return record.event.descriptionUrl ? (
                <a target="_blank" href={record.event.descriptionUrl}>
                  {value}
                </a>
              ) : (
                value
              );
            },
          },
          {
            title: 'Broadcast Url',
            width: 140,
            dataIndex: 'broadcastUrl',
            render: (url: string) =>
              url ? (
                <a target="_blank" href={url}>
                  Link
                </a>
              ) : (
                ''
              ),
          },
          {
            title: 'Organizer',
            width: 140,
            dataIndex: ['organizer', 'githubId'],
            render: (value: string) => (value ? <GithubUserLink value={value} /> : ''),
          },
          {
            title: 'Details Url',
            dataIndex: 'detailsUrl',
            render: (url: string) =>
              url ? (
                <a target="_blank" href={url}>
                  Details
                </a>
              ) : (
                ''
              ),
          },
          { title: 'Comment', dataIndex: 'comment' },
        ]}
      />
      <style jsx>{styles}</style>
    </PageLayout>
  );
}

const dateRenderer = (timeZone: string) => (value: string) =>
  value ? moment(value, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('YYYY-MM-DD') : '';

const timeRenderer = (timeZone: string) => (value: string) =>
  value ? moment(value, 'YYYY-MM-DD HH:mmZ').tz(timeZone).format('HH:mm') : '';

const tasksToEvents = (tasks: CourseTaskDetails[]) => {
  return tasks.reduce((acc: Array<CourseEvent>, task: CourseTaskDetails) => {
    if (task.type !== TaskTypes.test) {
      acc.push(createCourseEventFromTask(task, task.type));
    }
    acc.push(createCourseEventFromTask(task, task.type === TaskTypes.test ? TaskTypes.test : TaskTypes.deadline));
    return acc;
  }, []);
};

const createCourseEventFromTask = (task: CourseTaskDetails, type: string): CourseEvent => {
  return {
    id: task.id,
    dateTime: (type === TaskTypes.deadline ? task.studentEndDate : task.studentStartDate) || '',
    event: {
      type: type,
      name: task.name,
      descriptionUrl: task.descriptionUrl,
    },
    organizer: {
      githubId: task.taskOwner ? task.taskOwner.githubId : '',
    },
  } as CourseEvent;
};

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.5;
  }
`;

export default withCourseData(withSession(SchedulePage));
