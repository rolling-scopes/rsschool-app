import { Row, Select } from 'antd';
import { withSession, PageLayout } from 'components';
import TableView from 'components/Schedule/TableView';
import withCourseData from 'components/withCourseData';
import { useState, useMemo } from 'react';
import { CourseEvent, CourseService, CourseTaskDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import { TIMEZONES } from '../../configs/timezones';
import { useAsync } from 'react-use';
import { useLoading } from 'components/useLoading';

const TaskTypes = {
  deadline: 'deadline',
  test: 'test',
  newtask: 'newtask',
  lecture: 'lecture',
};

export function SchedulePage(props: CoursePageProps) {
  const [loading, withLoading] = useLoading(false);
  const [data, setData] = useState<CourseEvent[]>([]);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const courseService = useMemo(() => new CourseService(props.course.id), [props.course.id]);

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
              {tz}
            </Select.Option>
          ))}
        </Select>
      </Row>
      <TableView data={data} timeZone={timeZone} />
    </PageLayout>
  );
}

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

export default withCourseData(withSession(SchedulePage));
