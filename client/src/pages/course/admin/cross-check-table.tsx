import { QuestionCircleOutlined } from '@ant-design/icons';
import { Layout, Popover, Spin, Table, Typography } from 'antd';
import { GithubAvatar, Header, withSession } from 'components';
import { dateTimeRenderer, dateRenderer, getColumnSearchProps } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { CourseService, StudentScore, CrossCheckPairs } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { IPaginationInfo } from '../../../../../common/types/pagination';
import { ScoreTableFilters, ScoreOrder } from '../../../../../common/types/score';

const { Text } = Typography;

export function Page(props: CoursePageProps) {
  const courseService = useMemo(() => new CourseService(props.course.id), []);

  const [loading, setLoading] = useState(false);
  const [crossCheckList, setCrossCheckList] = useState({
    content: [] as CrossCheckPairs[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    orderBy: { field: 'totalScore', direction: 'desc' },
  });
  const [loaded, setLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const { id: courseId } = props.course;
      const crossCheckData = await courseService.getCrossCheckPairs(courseId);
      setCrossCheckList({
        ...crossCheckList, // todo: fix it
        content: crossCheckData,
      });
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseScore = useCallback(
    async (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => {
      console.log(pagination)
      console.log(filters)
      console.log(order)
      // setLoading(true);
      // try {
      //   const courseScore = await courseService.getCourseScore(
      //     pagination,
      //     { ...filters },
      //     { field: order.column?.sorter || 'totalScore', direction: order.order === 'ascend' ? 'asc' : 'desc' },
      //   );
      //   setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
      // } finally {
      //   setLoading(false);
      // }
    },
    [crossCheckList.content],
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const columns = useMemo(() => getColumns(crossCheckList.content), [crossCheckList.content]);

  return (
    <>
      <Header title="Cross-Check" username={props.session.githubId} courseName={props.course.name} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          {renderTable(loaded, crossCheckList.content, columns, crossCheckList.pagination, getCourseScore)}
        </Spin>
      </Layout.Content>
      <style jsx>{styles}</style>
    </>
  );
}

function renderTable(
  loaded: boolean,
  students: any[],
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
      rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
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
          render: value => <Text strong>{value}</Text>,
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

function getColumns(courseTasks: any[]) { // todo: fix it
  const columns = courseTasks.map(courseTask => ({
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
      const currentTask = d.taskResults.find(taskResult => taskResult.courseTaskId === courseTask.id);
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
