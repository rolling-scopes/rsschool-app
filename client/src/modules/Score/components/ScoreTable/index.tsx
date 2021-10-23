import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popover, Table } from 'antd';
import { dateTimeRenderer } from 'components/Table';
import { isUndefined } from 'lodash';
import { getColumns } from 'modules/Score/data/getColumns';
import { useScorePaging } from 'modules/Score/hooks/useScorePaging';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CourseService, CourseTask, IColumn, StudentScore } from 'services/course';
import { CoursePageProps } from 'services/models';
import { css } from 'styled-jsx/css';
import { IPaginationInfo } from 'common/types/pagination';
import { ScoreOrder, ScoreTableFilters } from 'common/types/score';
import { SettingsModal } from 'modules/Score/components/SettingsModal';
import { Store } from 'rc-field-form/lib/interface';
import { useLocalStorage } from 'react-use';

type Props = CoursePageProps & {
  onLoading: (value: boolean) => void;
  activeOnly: boolean;
};

export function ScoreTable(props: Props) {
  const router = useRouter();
  const { activeOnly } = props;
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const courseService = useMemo(() => new CourseService(props.course.id), []);

  const [students, setStudents] = useState({
    content: [] as StudentScore[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    filter: { activeOnly: true } as ScoreTableFilters,
    orderBy: { field: 'rank', direction: 'asc' },
  });

  const [courseTasks, setCourseTasks] = useState([] as CourseTask[]);
  const [loaded, setLoaded] = useState(false);

  const [getPagedData] = useScorePaging(router, courseService, activeOnly);

  const getCourseScore = async (pagination: IPaginationInfo, filters: ScoreTableFilters, order: ScoreOrder) => {
    try {
      props.onLoading(true);
      const data = await getPagedData(pagination, filters, order);
      setStudents({ ...students, content: data.content, pagination: data.pagination });
    } finally {
      props.onLoading(false);
    }
  };

  const loadInitialData = useCallback(async () => {
    try {
      props.onLoading(true);
      let filters = { activeOnly };

      if (!isUndefined(cityName)) {
        filters = { ...filters, cityName } as ScoreTableFilters;
      }
      if (!isUndefined(mentor)) {
        filters = { ...filters, ['mentor.githubId']: mentor } as ScoreTableFilters;
      }

      const [courseScore, courseTasks] = await Promise.all([
        courseService.getCourseScore(students.pagination, filters, students.orderBy),
        courseService.getCourseTasks(),
      ]);
      const sortedTasks = courseTasks
        .filter(task => !!task.studentEndDate || props.course.completed)
        .map(task => ({
          ...task,
          isVisible: !notVisibleColumns?.includes(task.name),
        }));
      setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
      setCourseTasks(sortedTasks);

      setLoaded(true);
    } finally {
      props.onLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => loadInitialData() as any, [activeOnly]);

  const [isVisibleSetting, setIsVisibleSettings] = useState(false);

  const columns = getColumns({
    cityName,
    mentor,
    handleSettings: () => setIsVisibleSettings(true),
    taskColumns: getTaskColumns(courseTasks),
  });

  const getVisibleColumns = (columns: any[]) => columns.filter(column => !notVisibleColumns?.includes(column.name));

  const [notVisibleColumns, setNotVisibleColumns] = useLocalStorage<string[]>('notVisibleColumns', []);

  const handleModalCancel = () => {
    setIsVisibleSettings(!isVisibleSetting);
  };

  const handleModalOk = (values: Store) => {
    setNotVisibleColumns(Object.keys(values).filter((value: string) => values[value] === false));
    setIsVisibleSettings(!isVisibleSetting);
  };

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Table<StudentScore>
        className="table-score"
        showHeader
        scroll={{ x: getTableWidth(getVisibleColumns(columns).length), y: 'calc(100vh - 250px)' }}
        pagination={{ ...students.pagination, showTotal: total => `Total ${total} students` }}
        rowKey="githubId"
        rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
        dataSource={students.content}
        onChange={getCourseScore as any}
        columns={getVisibleColumns(columns)}
      />
      <SettingsModal
        courseTasks={courseTasks}
        isVisible={isVisibleSetting}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
      <style jsx>{styles}</style>
    </>
  );
}

function getTableWidth(columnsCount: number) {
  const columnWidth = 90;
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = columnsCount * columnWidth;
  return tableWidth;
}

function getTaskColumns(courseTasks: CourseTask[]): IColumn[] {
  const columns = courseTasks.map(courseTask => ({
    dataIndex: courseTask.id.toString(),
    title: () => {
      const icon = (
        <Popover
          content={
            <ul>
              <li>Coefficient: {courseTask.scoreWeight}</li>
              <li>Deadline: {dateTimeRenderer(courseTask.studentEndDate)}</li>
              <li>Max. score: {courseTask.maxScore}</li>
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
    name: courseTask.name,
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
