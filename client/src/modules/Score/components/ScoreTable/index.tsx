import { Table, TablePaginationConfig } from 'antd';
import { isUndefined } from 'lodash';
import { getColumns } from 'modules/Score/data/getColumns';
import { getTaskColumns } from 'modules/Score/data/getTaskColumns';
import { useScorePaging } from 'modules/Score/hooks/useScorePaging';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnTypeWithName, CourseService, StudentScore, StudentScoreWithCrossCheckScore } from 'services/course';
import { CoursePageProps } from 'services/models';
import css from 'styled-jsx/css';
import { IPaginationInfo } from 'common/types/pagination';
import { ScoreOrder, ScoreTableFilters } from 'common/types/score';
import { SettingsModal } from 'modules/Score/components/SettingsModal';
import { Store } from 'rc-field-form/lib/interface';
import { useLocalStorage } from 'react-use';
import { CoursesTasksApi, CourseTaskDto } from 'api';
import useWindowDimensions from 'utils/useWindowDimensions';
import { SorterResult } from 'antd/lib/table/interface';

type Props = CoursePageProps & {
  onLoading: (value: boolean) => void;
  activeOnly: boolean;
};

type TableScoreOrder = SorterResult<StudentScore> | SorterResult<StudentScore>[];

interface ScoreTableFiltersModified extends Omit<ScoreTableFilters, 'activeOnly'> {
  activeOnly?: boolean;
}

const courseTasksApi = new CoursesTasksApi();

export function ScoreTable(props: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { activeOnly } = props;
  const { ['mentor.githubId']: mentor, cityName } = router.query;

  const [isVisibleSetting, setIsVisibleSettings] = useState(false);
  const [columns, setColumns] = useState<ColumnTypeWithName<StudentScoreWithCrossCheckScore>[]>([]);
  const [fixedColumn, setFixedColumn] = useState<boolean>(true);
  const [courseTasks, setCourseTasks] = useState([] as CourseTaskDto[]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState(['']);
  const [students, setStudents] = useState({
    content: [] as StudentScore[],
    pagination: { current: 1, pageSize: 100 } as IPaginationInfo,
    filter: { activeOnly: true } as ScoreTableFilters,
    orderBy: { field: 'rank', direction: 'asc' },
  });

  const [notVisibleColumns, setNotVisibleColumns] = useLocalStorage<string[]>('notVisibleColumns', []);
  const courseService = useMemo(() => new CourseService(props.course.id), []);
  const [getPagedData] = useScorePaging(router, courseService, activeOnly);

  const getCourseScore = async (
    pagination: TablePaginationConfig,
    filters: ScoreTableFiltersModified,
    order: TableScoreOrder,
  ) => {
    try {
      props.onLoading(true);
      const data = await getPagedData(pagination as IPaginationInfo, filters as ScoreTableFilters, order as ScoreOrder);
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
        courseTasksApi.getCourseTasks(props.course.id),
      ]);
      const sortedTasks = courseTasks.data
        .filter(task => !!task.studentEndDate || props.course.completed)
        .map(task => ({
          ...task,
          isVisible: !notVisibleColumns?.includes(task.name),
        }));
      setStudents({ ...students, content: courseScore.content, pagination: courseScore.pagination });
      setCourseTasks(sortedTasks);
      setColumns(
        getColumns({
          cityName,
          mentor,
          handleSettings: () => setIsVisibleSettings(true),
          taskColumns: getTaskColumns(sortedTasks),
        }),
      );

      setLoaded(true);
    } finally {
      props.onLoading(false);
    }
  }, [activeOnly]);

  const getVisibleColumns = (columns: ColumnTypeWithName<StudentScoreWithCrossCheckScore>[]) =>
    columns.filter(column => (column.name ? !notVisibleColumns?.includes(column.name) : true));

  const handleModalCancel = () => {
    setIsVisibleSettings(!isVisibleSetting);
  };

  const handleModalOk = (values: Store) => {
    setNotVisibleColumns(Object.keys(values).filter((value: string) => values[value] === false));
    setIsVisibleSettings(!isVisibleSetting);
  };

  useEffect(() => {
    loadInitialData();
  }, [activeOnly]);

  useEffect(() => {
    if (width < 400) {
      setFixedColumn(false);
      return;
    }

    setFixedColumn(true);
  }, [width]);

  useEffect(() => {
    setColumns(prevColumns => {
      const githubColumn = prevColumns.find(el => el.key === 'githubId');
      if (githubColumn) {
        githubColumn.fixed = fixedColumn ? 'left' : false;
      }

      return prevColumns;
    });
  }, [fixedColumn, loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Table<StudentScore>
        className="table-score"
        showHeader
        scroll={{ x: getTableWidth(getVisibleColumns(columns).length), y: 'calc(95vh - 290px)' }}
        pagination={{ ...students.pagination, showTotal: total => `Total ${total} students` }}
        rowKey="githubId"
        rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
        dataSource={students.content}
        onChange={getCourseScore}
        columns={getVisibleColumns(columns)}
        rowSelection={{
          selectedRowKeys: state,
          onChange: (_, selectedRows) => {
            setState(selectedRows.map(row => row.githubId));
          },
          type: 'radio',
          columnWidth: 0,
          renderCell: () => '',
        }}
        onRow={record => {
          return {
            onClick: () => {
              setState([record.githubId]);
            },
          };
        }}
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
  :global(.table-score .ant-table-body) {
    min-height: 200px;
  }
`;
