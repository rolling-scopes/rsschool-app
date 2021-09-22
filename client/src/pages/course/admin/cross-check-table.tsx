import { Button, Layout, Modal, Spin, Table, Typography } from 'antd';
import { GithubAvatar, Header, withSession } from 'components';
import { omit } from 'lodash';
import { dateTimeRenderer, getColumnSearchProps } from 'components/Table';
import withCourseData from 'components/withCourseData';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTaskDetails, CrossCheckPairs } from 'services/course';
import { CoursePageProps } from 'services/models';
import { css } from 'styled-jsx/css';
import { IPaginationInfo } from '../../../../../common/types/pagination';
import { ScoreOrder, ScoreTableFilters } from '../../../../../common/types/score';
import { BadReviewControllers } from 'components/BadReview/BadReviewControllers';

const { Text } = Typography;

export type CrossCheckFieldsTypes = {
  task: string;
  checkerStudent: string;
  student: string;
  url: string;
  score: string;
};

export const fields = {
  task: 'task',
  checkerStudent: 'checkerStudent',
  student: 'student',
  url: 'url',
  score: 'score',
  submittedDate: 'submittedDate',
  reviewedDate: 'reviewedDate',
};

export function Page(props: CoursePageProps) {
  const [modal, contextHolder] = Modal.useModal();
  const courseService = useMemo(() => new CourseService(props.course?.id), [props.course]);

  const [loading, setLoading] = useState(false);
  const [courseTasks, setCourseTasks] = useState<CourseTaskDetails[]>([]);
  const [crossCheckList, setCrossCheckList] = useState({
    content: [] as CrossCheckPairs[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    orderBy: { field: 'task,name', order: 'asc' },
  });
  const [loaded, setLoaded] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [crossCheckData, tasksFromReq] = await Promise.all([
        courseService.getCrossCheckPairs(crossCheckList.pagination, {}, crossCheckList.orderBy),
        courseService.getCourseTasksDetails(),
      ]);
      setCourseTasks(tasksFromReq.filter(task => task.pairsCount));
      setCrossCheckList({
        content: crossCheckData.content,
        pagination: crossCheckData.pagination,
        orderBy: crossCheckList.orderBy,
      });
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseScore = useCallback(
    async (pagination: IPaginationInfo, filters: any, order: ScoreOrder) => {
      const orderBy = {
        field: order.field,
        order: order.order === 'ascend' ? 'ASC' : 'DESC',
      };
      setLoading(true);
      try {
        const crossCheckData = await courseService.getCrossCheckPairs(pagination, filters, orderBy);
        setCrossCheckList({
          content: crossCheckData.content,
          pagination: crossCheckData.pagination,
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
    <>
      <Header title="Cross-Check" username={props.session.githubId} courseName={props.course.name} />
      {contextHolder}
      <Layout.Content style={{ margin: 8 }}>
        <Spin spinning={loading}>
          <BadReviewControllers courseTasks={courseTasks} courseId={props.course?.id} />
          {renderTable(
            loaded,
            crossCheckList.content,
            crossCheckList.pagination,
            getCourseScore,
            ({ comment, checkerStudent }) => {
              modal.info({
                width: 600,
                title: `Comment from ${checkerStudent.githubId}`,
                content: comment.split('\n').map(text => <p>{text}</p>),
              });
            },
          )}
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
  viewComment: (value: CrossCheckPairs) => void,
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
      dataSource={crossCheckPairs}
      onChange={handleChange as any}
      columns={[
        {
          title: 'Task',
          fixed: 'left',
          dataIndex: ['task', 'name'],
          key: fields.task,
          width: 50,
          sorter: true,
          ...omit(getColumnSearchProps(['task', 'name']), 'onFilter'),
        },
        {
          title: 'Checker',
          fixed: 'left',
          key: fields.checkerStudent,
          dataIndex: ['checkerStudent', 'githubId'],
          sorter: true,
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
          ...getColumnSearchProps('url'),
        },
        {
          title: 'Score',
          dataIndex: 'score',
          key: fields.score,
          width: 80,
          sorter: true,
          render: value => <Text strong>{value}</Text>,
        },
        {
          title: 'Submitted Date',
          dataIndex: 'submittedDate',
          key: fields.submittedDate,
          width: 80,
          sorter: true,
          render: dateTimeRenderer,
        },
        {
          title: 'Reviewed Date',
          dataIndex: 'reviewedDate',
          key: fields.reviewedDate,
          width: 80,
          sorter: true,
          render: dateTimeRenderer,
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
