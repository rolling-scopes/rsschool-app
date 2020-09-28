import { Layout, Spin, Table, Typography } from 'antd';
import { GithubAvatar, Header, withSession } from 'components';
import { getColumnSearchProps } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { CourseService, CrossCheckPairs } from 'services/course';
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
    // orderBy: { field: 'totalScore', direction: 'desc' },
  });
  const [loaded, setLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const crossCheckData = await courseService.getCrossCheckPairs();
      setCrossCheckList(crossCheckData);
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

  return (
    <>
      <Header title="Cross-Check" username={props.session.githubId} courseName={props.course.name} />
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          {renderTable(loaded, crossCheckList.content, crossCheckList.pagination, getCourseScore)}
        </Spin>
      </Layout.Content>
      <style jsx>{styles}</style>
    </>
  );
}

function renderTable(
  loaded: boolean,
  crossCheckPairs: CrossCheckPairs[],
  pagination: IPaginationInfo,
  handleChange: (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => void,
) {
  if (!loaded) {
    return null;
  }
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = 800;
  return (
    <Table<CrossCheckPairs>
      className="table-score"
      showHeader
      scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
      pagination={pagination}
      rowKey="courseTask.id"
      dataSource={crossCheckPairs}
      onChange={handleChange as any}
      columns={[
        {
          title: 'Task',
          fixed: 'left',
          dataIndex: ['task', 'name'],
          key: 'task.id',
          width: 50,
          // sorter: ['task', 'name'],
        },
        {
          title: 'Checker',
          fixed: 'left',
          key: 'checkerStudent.githubId',
          dataIndex: ['checkerStudent', 'githubId'],
          // sorter: ['checkerStudent', 'githubId'],
          width: 150,
          render: (value: string) => (
            <div>
              {value ? <>
                <GithubAvatar githubId={value} size={24} />
                &nbsp;
                <a target="_blank" href={`https://github.com/${value}`}>
                  {value}
                </a>
              </> : null}
            </div>
          ),
          ...getColumnSearchProps(['checkerStudent', 'githubId']),
        },
        {
          title: 'Student',
          key: 'student.githubId',
          dataIndex: ['student', 'githubId'],
          // sorter: ['student', 'githubId'],
          width: 150,
          render: (value: string) => (
            <div>
              {value ? <>
                <GithubAvatar githubId={value} size={24} />
                &nbsp;
                <a target="_blank" href={`https://github.com/${value}`}>
                  {value}
                </a>
              </> : null}
            </div>
          ),
          ...getColumnSearchProps(['student', 'githubId']),
        },
        {
          title: 'Url',
          dataIndex: 'url',
          width: 150,
          // sorter: 'url',
          ...getColumnSearchProps('url'),
        },
        {
          title: 'Score',
          dataIndex: 'score',
          width: 80,
          // sorter: 'score',
          render: value => <Text strong>{value}</Text>,
        },
      ]}
    />
  );
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
