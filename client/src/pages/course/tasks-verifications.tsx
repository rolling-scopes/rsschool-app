import { Table } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { Header, withSession } from 'components';
import withCourseData from 'components/withCourseData';
import { dateTimeRenderer } from 'components/Table/renderers';
import * as React from 'react';
import { CourseService, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';

type Props = CoursePageProps & FormComponentProps;

type State = {
  data: CourseTask[];
  isLoading: boolean;
};

class TasksVerificationsPage extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    data: [],
  };

  private courseService: CourseService;

  constructor(props: Props) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    const data = await this.courseService.getTaskVerifications();
    this.setState({ data });
  }

  render() {
    return (
      <>
        <Header
          title="Tasks Verifications"
          courseName={this.props.course.name}
          username={this.props.session.githubId}
        />
        <Table
          size="small"
          pagination={{ pageSize: 100 }}
          bordered
          columns={[
            {
              title: 'Date/Time',
              dataIndex: 'createdDate',
              render: dateTimeRenderer,
              width: 200,
            },
            {
              title: 'Task Name',
              dataIndex: 'courseTask.task.name',
              width: 300,
            },
            {
              title: 'Score',
              dataIndex: 'score',
              width: 100,
            },
            {
              title: 'Details',
              dataIndex: 'details',
            },
          ]}
          dataSource={this.state.data}
        />
      </>
    );
  }
}

export default withCourseData(withSession(TasksVerificationsPage));
