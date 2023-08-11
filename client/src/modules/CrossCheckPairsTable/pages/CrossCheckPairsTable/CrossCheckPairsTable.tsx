import { Collapse, Modal, Space, Table, TablePaginationConfig } from 'antd';
import { Comment } from '@ant-design/compatible';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';
import { IPaginationInfo } from 'common/types/pagination';
import { BadReviewControllers } from 'modules/CrossCheckPairsTable/components/BadReview/BadReviewControllers';
import { AdminPageLayout } from 'components/PageLayout';
import { dateTimeRenderer } from 'components/Table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTaskDetails } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { CoursesTasksApi, CrossCheckMessageDtoRoleEnum, CrossCheckPairDto } from 'api';
import PreparedComment from 'components/Forms/PreparedComment';
import { Message } from 'modules/CrossCheck/components/SolutionReview/Message';
import { CrossCheckCriteria } from 'modules/CrossCheck/components/criteria/CrossCheckCriteria';
import { CustomColumnType, fields, getColumns } from 'modules/CrossCheckPairsTable/data/getColumns';

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

export default function Page(props: CoursePageProps) {
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
      if (Array.isArray(sorter)) {
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
        ({ historicalScores, checker, messages }) => {
          modal.info({
            width: 1020,
            title: `Comment from ${checker.githubId}`,
            content: historicalScores.map((historicalScore, index) => (
              <Space direction="vertical" key={historicalScore.dateTime} style={{ width: '100%' }}>
                <Comment
                  content={
                    <>
                      {dateTimeRenderer(historicalScore.dateTime)}
                      <PreparedComment text={historicalScore.comment}></PreparedComment>
                      {index === 0 &&
                        messages.length > 0 &&
                        messages.map(message => (
                          <Message
                            key={message.timestamp}
                            message={message}
                            currentRole={CrossCheckMessageDtoRoleEnum.Student}
                            settings={{ areContactsVisible: true }}
                          />
                        ))}
                    </>
                  }
                />
                {historicalScore.criteria?.length ? (
                  <Collapse>
                    <Collapse.Panel key={historicalScore.dateTime} header="Detailed feedback">
                      <CrossCheckCriteria criteria={historicalScore.criteria} />
                    </Collapse.Panel>
                  </Collapse>
                ) : null}
              </Space>
            )),
          });
        },
      )}
      <style jsx>{styles}</style>
    </AdminPageLayout>
  );
}

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
