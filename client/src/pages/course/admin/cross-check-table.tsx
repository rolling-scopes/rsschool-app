import { Button, Comment, Modal, Table, TablePaginationConfig, Typography } from 'antd';
import { ColumnType, FilterValue, SorterResult } from 'antd/lib/table/interface';
import { IPaginationInfo } from 'common/types/pagination';
import { BadReviewControllers } from 'components/BadReview/BadReviewControllers';
import { GithubAvatar } from 'components/GithubAvatar';
import { AdminPageLayout } from 'components/PageLayout';
import { dateTimeRenderer, getColumnSearchProps } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { withSession } from 'components/withSession';
import { isArray, omit } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTaskDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { CoursesTasksApi, CrossCheckPairDto } from 'api';
import PreparedComment from 'components/Forms/PreparedComment';

const { Text } = Typography;

const fields = {
  task: 'task',
  checker: 'checker',
  student: 'student',
  url: 'url',
  score: 'score',
  submittedDate: 'submittedDate',
  reviewedDate: 'reviewedDate',
};

interface CustomColumnType<RecordType> extends ColumnType<RecordType> {
  sorterField?: string;
}

interface CustomSorterResult<RecordType> extends SorterResult<RecordType> {
  column?: CustomColumnType<RecordType>;
}

type Sorter<RecordType> = CustomSorterResult<RecordType> | CustomSorterResult<RecordType>[];

type Filters = Omit<typeof fields, 'score' | 'submittedDate' | 'reviewedDate'>;

enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

const DEFAULT_ORDER_BY = 'task';
const DEFAULT_ORDER_DIRECTION = OrderDirection.ASC;

const api = new CoursesTasksApi();

export function Page(props: CoursePageProps) {
  const [modal, contextHolder] = Modal.useModal();
  const courseId = props.course.id;
  const courseService = useMemo(() => new CourseService(courseId), [props.course]);

  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState<CourseTaskDetails[]>([]);
  const [crossCheckList, setCrossCheckList] = useState({
    content: [] as CrossCheckPairDto[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    orderBy: { field: DEFAULT_ORDER_BY, order: DEFAULT_ORDER_DIRECTION },
  });
  const [loaded, setLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: crossCheckData }, tasksFromReq] = await Promise.all([
        api.getCrossCheckPairs(
          courseId,
          crossCheckList.pagination.pageSize,
          crossCheckList.pagination.current,
          crossCheckList.orderBy.field,
          crossCheckList.orderBy.order,
        ),
        courseService.getCourseTasksDetails(),
      ]);
      setCourseTasks(tasksFromReq.filter(task => task.pairsCount));
      setCrossCheckList({
        content: crossCheckData.items,
        pagination: crossCheckData.pagination,
        orderBy: crossCheckList.orderBy,
      });
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseScore = useCallback(
    async (
      pagination: TablePaginationConfig,
      filters: Record<keyof Filters, FilterValue | null>,
      sorter: Sorter<CrossCheckPairDto>,
    ) => {
      if (isArray(sorter)) {
        return;
      }

      const orderBy = {
        field: sorter.column?.sorterField ?? DEFAULT_ORDER_BY,
        order: sorter.order === 'descend' ? OrderDirection.DESC : OrderDirection.ASC,
      };

      setLoading(true);
      try {
        const { data } = await api.getCrossCheckPairs(
          courseId,
          pagination.pageSize as IPaginationInfo['pageSize'],
          pagination.current as IPaginationInfo['current'],
          orderBy.field,
          orderBy.order,
          filters.checker?.toString(),
          filters.student?.toString(),
          filters.url?.toString(),
          filters.task?.toString(),
        );
        setCrossCheckList({
          content: data.items,
          pagination: data.pagination,
          orderBy: {
            field: orderBy.field,
            order: orderBy.order,
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [crossCheckList.content],
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <AdminPageLayout
      session={props.session}
      loading={loading}
      title="Cross-Check"
      courseName={props.course.name}
      courses={[props.course]}
    >
      {contextHolder}
      <BadReviewControllers courseTasks={courseTasks} courseId={props.course?.id} />
      {renderTable(
        loaded,
        crossCheckList.content,
        crossCheckList.pagination,
        getCourseScore,
        ({ historicalScores, checker }) => {
          modal.info({
            width: 600,
            title: `Comment from ${checker.githubId}`,
            content: historicalScores.map(historicalScore => (
              <Comment
                key={historicalScore.dateTime}
                content={
                  <>
                    {dateTimeRenderer(historicalScore.dateTime)}
                    <PreparedComment text={historicalScore.comment}></PreparedComment>
                  </>
                }
              />
            )),
          });
        },
      )}
      <style jsx>{styles}</style>
    </AdminPageLayout>
  );
}

const getColumns = (viewComment: (value: CrossCheckPairDto) => void): CustomColumnType<CrossCheckPairDto>[] => [
  {
    title: 'Task',
    fixed: 'left',
    dataIndex: ['task', 'name'],
    key: fields.task,
    width: 100,
    sorter: true,
    sorterField: 'task',
    ...omit(getColumnSearchProps(['task', 'name']), 'onFilter'),
  },
  {
    title: 'Checker',
    fixed: 'left',
    key: fields.checker,
    dataIndex: ['checker', 'githubId'],
    sorter: true,
    sorterField: 'checker',
    width: 150,
    render: (value: string) => (
      <div>
        {value ? (
          <>
            <GithubAvatar githubId={value} size={24} />
            &nbsp;
            <a target="_blank" href={`https://github.com/${value}`}>
              {value}
            </a>
          </>
        ) : null}
      </div>
    ),
    ...omit(getColumnSearchProps(['checkerStudent', 'githubId']), 'onFilter'),
  },
  {
    title: 'Student',
    key: fields.student,
    dataIndex: ['student', 'githubId'],
    sorter: true,
    sorterField: 'student',
    width: 150,
    render: (value: string) => (
      <div>
        {value ? (
          <>
            <GithubAvatar githubId={value} size={24} />
            &nbsp;
            <a target="_blank" href={`https://github.com/${value}`}>
              {value}
            </a>
          </>
        ) : null}
      </div>
    ),
    ...omit(getColumnSearchProps(['student', 'githubId']), 'onFilter'),
  },
  {
    title: 'Url',
    dataIndex: 'url',
    key: fields.url,
    width: 150,
    sorter: true,
    sorterField: 'url',
    ...getColumnSearchProps('url'),
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: fields.score,
    width: 80,
    sorter: true,
    sorterField: 'score',
    render: value => <Text strong>{value ?? '(Empty)'}</Text>,
  },
  {
    title: 'Submitted Date',
    dataIndex: 'submittedDate',
    key: fields.submittedDate,
    width: 80,
    sorter: true,
    sorterField: 'submittedDate',
    render: dateTimeRenderer,
  },
  {
    title: 'Reviewed Date',
    dataIndex: 'reviewedDate',
    key: fields.reviewedDate,
    width: 80,
    sorter: true,
    sorterField: 'reviewedDate',
    render: (_, record) => dateTimeRenderer(record.historicalScores?.at(-1)?.dateTime ?? null),
  },
  {
    title: 'Comment',
    dataIndex: 'comment',
    key: 'comment',
    width: 60,
    render: (_, record) => (
      <Button onClick={() => viewComment(record)} type="link" size="small">
        Show
      </Button>
    ),
  },
];

function renderTable(
  loaded: boolean,
  crossCheckPairs: CrossCheckPairDto[],
  pagination: TablePaginationConfig,
  handleChange: (
    pagination: TablePaginationConfig,
    filters: Record<keyof Filters, FilterValue | null>,
    sorter: Sorter<CrossCheckPairDto>,
  ) => void,
  viewComment: (value: CrossCheckPairDto) => void,
) {
  if (!loaded) {
    return null;
  }
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = 800;
  return (
    <Table<CrossCheckPairDto>
      className="table-score"
      showHeader
      scroll={{ x: tableWidth, y: 'calc(100vh - 250px)' }}
      pagination={pagination}
      dataSource={crossCheckPairs}
      onChange={handleChange}
      key="id"
      columns={getColumns(viewComment)}
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
