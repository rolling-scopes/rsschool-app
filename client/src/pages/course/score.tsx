import { useEffect, useState } from 'react';
import { FileExcelOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Table, Typography, Button, Popover, Spin, Switch } from 'antd';
import { Header, withSession, GithubAvatar } from 'components';
import withCourseData from 'components/withCourseData';
import { getColumnSearchProps, stringSorter, dateRenderer, numberSorter } from 'components/Table';
import { CourseTask, CourseService, StudentScore } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';

const { Text } = Typography;

export function ScorePage(props: CoursePageProps) {
  const courseService = new CourseService(props.course.id);
  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [students, setStudents] = useState([] as StudentScore[]);
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);

  useEffect(() => {
    setLoading(true);
    Promise.all([courseService.getCourseScore(activeOnly), courseService.getCourseTasks()]).then(
      ([courseScore, courseTasks]) => {
        const sortedTasks = courseTasks.filter(task => !!task.studentEndDate || props.course.completed);

        setLoading(false);
        setStudents(courseScore);
        setCourseTasks(sortedTasks);
      },
    );
  }, []);

  const handleActiveOnlyChange = async () => {
    const value = !activeOnly;
    setActiveOnly(value);
    setLoading(true);
    try {
      const courseScore = await courseService.getCourseScore(value);
      setStudents(courseScore);
    } finally {
      setLoading(false);
    }
  };

  const { isAdmin, isHirer, roles, coursesRoles } = props.session;
  const courseId = props.course.id;
  const csvEnabled =
    isAdmin || isHirer || roles[courseId] === 'coursemanager' || coursesRoles?.[courseId]?.includes('manager');
  // const columnWidth = 90;
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  // const tableWidth = this.getColumns().length * columnWidth + 800;
  return (
    <>
      <Header title="Score" username={props.session.githubId} courseName={props.course.name} />
      <Spin spinning={loading}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div>
            <span style={{ display: 'inline-block', lineHeight: '24px' }}>Active Students Only</span>{' '}
            <Switch checked={activeOnly} onChange={handleActiveOnlyChange} />
          </div>
          <Text mark>Score is refreshed every 5 minutes</Text>
          {csvEnabled && (
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => (window.location.href = `/api/course/${props.course.id}/students/score/csv`)}
            >
              Export CSV
            </Button>
          )}
        </div>

        <Table<StudentScore>
          className="m-3 table-score"
          bordered
          style={{ overflowY: 'scroll' }}
          pagination={{ pageSize: 100 }}
          size="small"
          rowKey="githubId"
          rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
          dataSource={students}
          columns={[
            {
              title: '#',
              fixed: 'left',
              dataIndex: 'rank',
              width: 50,
              sorter: numberSorter('rank'),
            },
            {
              title: 'Github',
              fixed: 'left',
              dataIndex: 'githubId',
              sorter: stringSorter('githubId'),
              width: 150,
              render: (value: string) => (
                <div className="d-flex flex-row">
                  <GithubAvatar githubId={value} size={24} />
                  &nbsp;
                  <a target="_blank" href={`https://github.com/${value}`}>
                    {value}
                  </a>
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
              width: 150,
              sorter: stringSorter('locationName'),
              ...getColumnSearchProps('locationName'),
            },
            {
              title: 'Total',
              dataIndex: 'totalScore',
              width: 80,
              sorter: numberSorter('totalScore'),
              render: value => <Text strong>{value}</Text>,
            },
            ...getColumns(courseTasks),
            {
              title: 'Mentor',
              dataIndex: 'mentor.githubId',
              render: (value: string) => <a href={`/profile?githubId=${value}`}>{value}</a>,
              ...getColumnSearchProps('mentor.githubId'),
            },
          ]}
        />
      </Spin>
      <style jsx>{styles}</style>
    </>
  );
}

function getColumns(courseTasks: any[]) {
  const columns = courseTasks.map(task => ({
    dataIndex: task.id.toString(),
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
          <QuestionCircleOutlined title="Click for detatils" />
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
    width: 120,
    className: 'align-right',
    render: (_: any, d: StudentScore) => {
      const currentTask = d.taskResults.find((taskResult: any) => taskResult.courseTaskId === task.courseTaskId);
      return currentTask ? <div>{currentTask.score}</div> : 0;
    },
  }));
  return columns;
}

// private handleActiveOnlyChange = async () => {
//   const activeOnly = !this.state.activeOnly;
//   this.setState({ activeOnly, isLoading: true });
//   try {
//     const courseScore = await this.courseService.getCourseScore(activeOnly);
//     this.setState({ students: courseScore, isLoading: false });
//   } catch (err) {
//     this.setState({ isLoading: false });
//   }
// };

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
