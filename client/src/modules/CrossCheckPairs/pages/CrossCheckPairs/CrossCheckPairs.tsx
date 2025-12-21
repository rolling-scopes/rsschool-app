import { Collapse, Modal, Space, TablePaginationConfig } from 'antd';
import { Comment } from '@ant-design/compatible';
import { FilterValue } from 'antd/lib/table/interface';
import { IPaginationInfo } from '@client/utils/pagination';
import { AdminPageLayout } from 'components/PageLayout';
import { dateTimeRenderer } from 'components/Table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTaskDetails } from 'services/course';
import { CoursesTasksApi, CrossCheckMessageDtoRoleEnum, CrossCheckPairDto } from 'api';
import PreparedComment from 'components/Forms/PreparedComment';
import { Message } from 'modules/CrossCheck/components/SolutionReview/Message';
import { CrossCheckCriteria } from 'modules/CrossCheck/components/criteria/CrossCheckCriteria';
import { BadReviewControllers } from 'modules/CrossCheckPairs/components/BadReview/BadReviewControllers';
import {
  Filters,
  Sorter,
  CrossCheckPairsTable,
} from 'modules/CrossCheckPairs/components/CrossCheckPairsTable/CrossCheckPairsTable';
import { useActiveCourseContext } from 'modules/Course/contexts';

enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

const DEFAULT_ORDER_BY = 'task';
const DEFAULT_ORDER_DIRECTION = OrderDirection.ASC;

const api = new CoursesTasksApi();

export default function Page() {
  const { course, courses } = useActiveCourseContext();
  const [modal, contextHolder] = Modal.useModal();
  const courseId = course.id;
  const courseService = useMemo(() => new CourseService(courseId), [course]);

  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState<CourseTaskDetails[]>([]);
  const [crossCheckList, setCrossCheckList] = useState({
    content: [] as CrossCheckPairDto[],
    pagination: { current: 1, pageSize: 50 } as IPaginationInfo,
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

  const handleViewComment = ({ historicalScores, checker, messages }: CrossCheckPairDto) => {
    modal.info({
      width: 1020,
      maskClosable: true,
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
  };

  return (
    <AdminPageLayout loading={loading} title="Cross-Check" showCourseName courses={courses}>
      {contextHolder}
      <BadReviewControllers courseTasks={courseTasks} courseId={course?.id} />
      <CrossCheckPairsTable
        loaded={loaded}
        crossCheckPairs={crossCheckList.content}
        pagination={crossCheckList.pagination}
        onChange={getCourseScore}
        viewComment={handleViewComment}
      />
    </AdminPageLayout>
  );
}
