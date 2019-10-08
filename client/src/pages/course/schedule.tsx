import { Form, Table, Tag, Row, Icon, Tooltip, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession, GithubUserLink } from 'components';
import { dateRenderer, timeRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseEvent, CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { formatTime } from 'services/formatter';
import css from 'styled-jsx/css';
import moment from 'moment';

type Props = CoursePageProps & FormComponentProps;

interface State {
  data: CourseEvent[];
}

enum EventTypeColor {
  task = 'red',
  test = 'green',
  lecture = 'blue',
}

class SchedulePage extends React.Component<Props, State> {
  state: State = {
    data: [],
  };

  startOfToday = moment().startOf('day');

  private courseService = new CourseService();

  async componentDidMount() {
    const courseId = this.props.course.id;
    const [events, tasks] = await Promise.all([
      this.courseService.getCourseEvents(courseId),
      this.courseService.getCourseTasks(courseId),
    ]);
    const data = events
      .concat(
        tasks.map(
          task =>
            ({
              id: task.id,
              date: task.studentEndDate ? dateRenderer(task.studentEndDate) : '',
              time: task.studentEndDate ? formatTime(task.studentEndDate) : '',
              event: {
                type: task.type === 'test' ? 'test' : 'task',
                name: task.name,
                descriptionUrl: task.descriptionUrl,
              },
            } as CourseEvent),
        ),
      )
      .sort((a, b) => a.date.localeCompare(b.date));
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <Header title="Schedule" username={this.props.session.githubId} />
        <Row type="flex" justify="end" className="m-3">
          <Button icon="calendar" href={`/api/course/${this.props.course.id}/events/ical`}>
            Events iCal
          </Button>
        </Row>
        <Table
          className="m-3"
          rowKey="id"
          pagination={{ pageSize: 100 }}
          size="small"
          dataSource={this.state.data}
          rowClassName={record => (moment(record.date).isBefore(this.startOfToday) ? 'rs-table-row-disabled' : '')}
          columns={[
            { title: 'Date', width: 120, dataIndex: 'date', render: dateRenderer },
            { title: 'Time', width: 60, dataIndex: 'time', render: timeRenderer },
            {
              title: 'Type',
              width: 100,
              dataIndex: 'event.type',
              render: (value: keyof typeof EventTypeColor) => <Tag color={EventTypeColor[value]}>{value}</Tag>,
            },
            {
              title: 'Place',
              dataIndex: 'place',
              render: (value: string) => {
                return value === 'Youtube Live' ? (
                  <div>
                    <Icon type="youtube" /> {value}{' '}
                    <Tooltip title="Ссылка будет в Discord">
                      <Icon type="question-circle" />
                    </Tooltip>
                  </div>
                ) : (
                  value
                );
              },
            },
            {
              title: 'Name',
              dataIndex: 'event.name',
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
              dataIndex: 'organizer.githubId',
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
      </div>
    );
  }
}

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.5;
  }
`;

export default withCourseData(withSession(Form.create()(SchedulePage)));
