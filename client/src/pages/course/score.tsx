import * as React from 'react';
import { Table, Typography, Button, Icon, Popover } from 'antd';
import { Header, withSession, LoadingScreen, GithubAvatar } from 'components';
import withCourseData from 'components/withCourseData';
import { getColumnSearchProps, stringSorter, dateRenderer, numberSorter } from 'components/Table';
import { CourseTask, CourseService, StudentScore } from 'services/course';
import { sortTasksByEndDate } from 'services/rules';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';

const { Text } = Typography;

type State = {
  students: StudentScore[];
  isLoading: boolean;
  courseTasks: CourseTask[];
};

class ScorePage extends React.Component<CoursePageProps, State> {
  state: State = {
    isLoading: false,
    students: [],
    courseTasks: [],
  };

  private courseService: CourseService;

  constructor(props: CoursePageProps) {
    super(props);
    this.courseService = new CourseService(props.course.id);
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    const courseId = this.props.course.id;
    const [courseScore, courseTasks] = await Promise.all([
      this.courseService.getCourseScore(courseId),
      this.courseService.getCourseTasks(),
    ]);

    const sortedTasks = courseTasks
      .filter(task => !!task.studentEndDate || this.props.course.completed)
      .sort(sortTasksByEndDate);

    this.setState({ students: courseScore, courseTasks: sortedTasks, isLoading: false });
  }

  render() {
    const { isAdmin, isHirer, roles } = this.props.session;
    const csvEnabled = isAdmin || isHirer || roles[this.props.course.id] === 'coursemanager';
    const columnWidth = 90;
    // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
    const tableWidth = this.getColumns().length * columnWidth + 800;
    return (
      <>
        <Header title="Score" username={this.props.session.githubId} courseName={this.props.course.name} />
        <LoadingScreen show={this.state.isLoading}>
          <div className="d-flex justify-content-between align-items-center m-2">
            <Text mark>Score is refreshed every 5 minutes</Text>

            {csvEnabled && (
              <Button
                icon="file-excel"
                onClick={() => (window.location.href = `/api/course/${this.props.course.id}/students/score/csv`)}
              >
                Export CSV
              </Button>
            )}
          </div>

          <Table<StudentScore>
            className="m-3 table-score"
            bordered
            scroll={{ x: tableWidth, y: 'calc(100vh - 300px)' }}
            style={{ overflowY: 'scroll' }}
            pagination={{ pageSize: 100 }}
            size="small"
            rowKey="githubId"
            rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
            dataSource={this.state.students}
            columns={[
              {
                title: '#',
                fixed: 'left',
                dataIndex: 'rank',
                key: 'rank',
                width: 50,
                sorter: numberSorter('rank'),
              },
              {
                title: 'Github',
                fixed: 'left',
                dataIndex: 'githubId',
                sorter: stringSorter('githubId'),
                width: 150,
                key: 'githubId',
                render: (value: string) => (
                  <div className="d-flex flex-row">
                    <GithubAvatar githubId={value} size={24} />
                    &nbsp;
                    <a href={`https://github.com/${value}`}>{value}</a>
                  </div>
                ),
                ...getColumnSearchProps('githubId'),
              },
              {
                title: 'Name',
                dataIndex: 'name',
                width: 150,
                sorter: stringSorter('name'),
                render: (value: any, record: StudentScore) => (
                  <a href={`/profile?githubId=${record.githubId}`}>{value}</a>
                ),
                ...getColumnSearchProps('name'),
              },
              {
                title: 'Location',
                dataIndex: 'locationName',
                key: 'locationName',
                width: 150,
                sorter: stringSorter('locationName'),
                ...getColumnSearchProps('locationName'),
              },
              {
                title: 'Total',
                dataIndex: 'totalScore',
                key: 'totalScore',
                width: 100,
                sorter: numberSorter('totalScore'),
                render: value => <Text strong>{value}</Text>,
              },
              ...this.getColumns(),
              {
                title: 'Mentor',
                dataIndex: 'mentor.githubId',
                key: 'mentor.githubId',
                // width: 100,
                render: (value: string) => <a href={`/profile?githubId=${value}`}>{value}</a>,
                ...getColumnSearchProps('mentor.githubId'),
              },
            ]}
          />
        </LoadingScreen>
        <style jsx>{styles}</style>
      </>
    );
  }

  private getColumns() {
    const columns = this.state.courseTasks.map(task => ({
      dataIndex: task.id.toString(),
      key: task.id.toString(),
      title: () => {
        const icon = (
          <Popover
            content={
              <ul>
                <li>Coefficient: {task.scoreWeight}</li>
                <li>Deadline: {dateRenderer(task.studentEndDate)}</li>
              </ul>
            }
            trigger="click"
          >
            <Icon type="question-circle" title="Click for detatils" />
          </Popover>
        );
        return task.descriptionUrl ? (
          <>
            <a className="table-header-link" target="_blank" href={task.descriptionUrl}>
              {task.name}
            </a>{' '}
            {icon}
          </>
        ) : (
          <div>
            {task.name} {icon}
          </div>
        );
      },
      width: 90,
      className: 'align-right',
      render: (_: any, d: StudentScore) => {
        const currentTask = d.taskResults.find((taskResult: any) => taskResult.courseTaskId === task.courseTaskId);
        return currentTask ? <div>{currentTask.score}</div> : 0;
      },
    }));
    return columns;
  }
}

const styles = css`
  :global(.rs-table-row-disabled) {
    opacity: 0.25;
  }
  :global(.table-score td, .table-score th) {
    padding: 0 5px !important;
    font-size: 11px;
  }
  :global(.table-score td a) {
    line-height: 24px;
  }
`;

export default withCourseData(withSession(ScorePage));
