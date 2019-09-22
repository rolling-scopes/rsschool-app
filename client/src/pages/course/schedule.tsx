import { Form, Table, Tag, Icon, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import { dateRenderer, timeRenderer } from 'components/Table';
import withCourseData from 'components/withCourseData';
import * as React from 'react';
import { CourseEvent, CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { formatTime } from 'services/formatter';

type Props = CoursePageProps & FormComponentProps;

interface State {
  data: CourseEvent[];
}

class SchedulePage extends React.Component<Props, State> {
  state: State = {
    data: [],
  };

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
                type: 'task',
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
    if (!this.props.session) {
      return null;
    }
    return (
      <div>
        <Header title="Schedule" username={this.props.session.githubId} />
        <Table
          className="m-3"
          rowKey="id"
          pagination={{ pageSize: 100 }}
          size="small"
          dataSource={this.state.data}
          columns={[
            { title: 'Date', width: 120, dataIndex: 'date', render: dateRenderer },
            { title: 'Time', width: 60, dataIndex: 'time', render: timeRenderer },
            {
              title: 'Type',
              width: 100,
              dataIndex: 'event.type',
              render: value => <Tag color={value === 'task' ? 'red' : 'blue'}>{value}</Tag>,
            },
            {
              title: 'Place',
              dataIndex: 'place',
              render: value => {
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
                return record.event.descriptionUrl ? <a href={record.event.descriptionUrl}>{value}</a> : value;
              },
            },

            { title: 'Coordinator', width: 140, dataIndex: 'coordinator' },
            { title: 'Comment', dataIndex: 'comment' },
          ]}
        />
      </div>
    );
  }
}

export default withCourseData(withSession(Form.create()(SchedulePage)));
