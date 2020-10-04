import { FileExcelOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Layout, Popover, Row, Spin, Switch, Table, Typography } from 'antd';
import { GithubAvatar, Header, withSession } from 'components';
import { dateTimeRenderer, dateRenderer, getColumnSearchProps } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { CourseService, StudentScore, CourseTask } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { IPaginationInfo } from '../../../../common/types/pagination';
import { ScoreTableFilters, ScoreOrder } from '../../../../common/types/score';

const { Text } = Typography;

export function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), []);

  const [loading, setLoading] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [students, setStudents] = useState({
    content: [] as StudentScore[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    filter: {
      activeOnly: true,
    } as ScoreTableFilters,
    orderBy: { field: 'rank', direction: 'asc' },
  });
  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [loaded, setLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseScore, courseTasks] = await Promise.all([
        courseService.getCourseScore(students.pagination, { activeOnly }, students.orderBy),
        courseService.getCourseTasks(),
      ]);
      const sortedTasks = courseTasks.filter((task) => !!task.studentEndDate || props.course.completed);
      setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
      setCourseTasks(sortedTasks);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseScore = useCallback(
    async (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => {
      setLoading(true);
      try {
        const field = order.column?.sorter || 'rank';
        const direction =
          field === 'rank' ? (order.order === 'descend' ? 'desc' : 'asc') : order.order === 'ascend' ? 'asc' : 'desc';
        const courseScore = await courseService.getCourseScore(
          pagination,
          { ...filters, activeOnly },
          { field, direction },
        );
        setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
      } finally {
        setLoading(false);
      }
    },
    [students],
  );

  const handleActiveOnlyChange = useCallback(async () => {
    const value = !activeOnly;
    setActiveOnly(value);
    setLoading(true);
    try {
      const courseScore = await courseService.getCourseScore(
        students.pagination,
        {
          ...students.filter,
          activeOnly: value,
        },
        students.orderBy,
      );
      setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const columns = useMemo(() => getColumns(courseTasks), [courseTasks, students]);

  return (
    <>
      <Header title="Score" username={props.session.githubId} courseName={props.course.name} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          <Row style={{ margin: '8px 0' }} justify="space-between">
            <div>
              <span style={{ display: 'inline-block', lineHeight: '24px' }}>Active Students Only</span>{' '}
              <Switch checked={activeOnly} onChange={handleActiveOnlyChange} />
            </div>
            <Text mark>Total score and position is updated every day at 00:00 GMT+3</Text>
            {renderCsvExportButton(props)}
          </Row>
          {renderTable(loaded, students.content, columns, students.pagination, getCourseScore)}
        </Spin>
      </Layout.Content>
      <style jsx>{styles}</style>
    </>
  );
}

function renderCsvExportButton(props: CoursePageProps) {
  const { isAdmin, isHirer, roles, coursesRoles } = props.session;
  const courseId = props.course.id;
  const courseRole = coursesRoles?.[courseId];
  const csvEnabled =
    isAdmin ||
    isHirer ||
    roles[courseId] === 'coursemanager' ||
    courseRole?.includes('manager') ||
    courseRole?.includes('supervisor');
  if (!csvEnabled) {
    return null;
  }
  return (
    <Button
      icon={<FileExcelOutlined />}
      onClick={() => (window.location.href = `/api/course/${props.course.id}/students/score/csv`)}
    >
      Export CSV
    </Button>
  );
}

function renderTable(
  loaded: boolean,
  students: StudentScore[],
  columns: any[],
  pagination: IPaginationInfo,
  handleChange: (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => void,
) {
  if (!loaded) {
    return null;
  }
  const columnWidth = 90;
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = columns.length * columnWidth + 800;
  return (
    <Table<StudentScore>
      className="table-score"
      showHeader
      scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
      pagination={pagination}
      rowKey="githubId"
      rowClassName={(record) => (!record.isActive ? 'rs-table-row-disabled' : '')}
      dataSource={students}
      onChange={handleChange as any}
      columns={[
        {
          title: '#',
          fixed: 'left',
          dataIndex: 'rank',
          key: 'rank',
          width: 50,
          sorter: 'rank',
        },
        {
          title: 'Github',
          fixed: 'left',
          key: 'githubId',
          dataIndex: 'githubId',
          sorter: 'githubId',
          width: 150,
          render: (value: string) => (
            <div>
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
          sorter: 'name',
          render: (value: any, record: StudentScore) => <a href={`/profile?githubId=${record.githubId}`}>{value}</a>,
          ...getColumnSearchProps('name'),
        },
        {
          title: 'Location',
          dataIndex: 'cityName',
          width: 150,
          sorter: 'cityName',
          ...getColumnSearchProps('cityName'),
        },
        {
          title: 'Total',
          dataIndex: 'totalScore',
          width: 80,
          sorter: 'totalScore',
          render: (value) => <Text strong>{value}</Text>,
        },
        ...columns,
        {
          title: 'Change Date',
          dataIndex: 'totalScoreChangeDate',
          width: 80,
          sorter: 'totalScoreChangeDate',
          render: dateRenderer,
        },
        {
          title: 'Last Commit Date',
          dataIndex: 'repositoryLastActivityDate',
          width: 80,
          sorter: 'repositoryLastActivityDate',
          render: dateRenderer,
        },
        {
          title: 'Mentor',
          dataIndex: ['mentor', 'githubId'],
          width: 150,
          sorter: 'mentor',
          render: (value: string) => <a href={`/profile?githubId=${value}`}>{value}</a>,
          ...getColumnSearchProps('mentor.githubId'),
        },
      ]}
    />
  );
}

function getColumns(courseTasks: CourseTask[]) {
  const columns = courseTasks.map((courseTask) => ({
    dataIndex: courseTask.id.toString(),
    title: () => {
      const icon = (
        <Popover
          content={
            <ul>
              <li>Coefficient: {courseTask.scoreWeight}</li>
              <li>Deadline: {dateTimeRenderer(courseTask.studentEndDate)}</li>
            </ul>
          }
          trigger="click"
        >
          <QuestionCircleOutlined title="Click for details" />
        </Popover>
      );
      return courseTask.descriptionUrl ? (
        <>
          <a className="table-header-link" target="_blank" href={courseTask.descriptionUrl}>
            {courseTask.name}
          </a>{' '}
          {icon}
        </>
      ) : (
        <div>
          {courseTask.name} {icon}
        </div>
      );
    },
    width: 100,
    className: 'align-right',
    render: (_: any, d: StudentScore) => {
      const currentTask = d.taskResults.find((taskResult) => taskResult.courseTaskId === courseTask.id);
      return currentTask ? <div>{currentTask.score}</div> : 0;
    },
  }));
  return columns;
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

export default withCourseData(withSession(Page));
