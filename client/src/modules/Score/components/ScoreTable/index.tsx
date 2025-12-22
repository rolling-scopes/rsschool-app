import { Table, TablePaginationConfig } from 'antd';
import { ColumnType, TableProps } from 'antd/lib/table';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';
import { Store } from 'antd/lib/form/interface';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from 'react-use';
import isUndefined from 'lodash/isUndefined';
import { useRouter } from 'next/router';
import { CoursesTasksApi, CourseTaskDto, ScoreStudentDto } from '@client/api';
import styles from './index.module.css';
import { getColumns } from 'modules/Score/data/getColumns';
import { getTaskColumns } from 'modules/Score/data/getTaskColumns';
import { useScorePaging } from 'modules/Score/hooks/useScorePaging';
import { SettingsDrawer } from 'modules/Score/components/SettingsDrawer';
import { CourseService } from 'services/course';
import { CoursePageProps } from 'services/models';
import { IPaginationInfo } from '@client/shared/utils/pagination';
import { ScoreOrder, ScoreTableFilters } from 'modules/Score/hooks/types';
import useWindowDimensions from '@client/shared/hooks/useWindowDimensions';
import { Summary } from './Summary';

type Props = CoursePageProps & {
  onLoading: (value: boolean) => void;
  activeOnly: boolean;
  isVisibleSetting: boolean;
  setIsVisibleSettings: (value: boolean) => void;
};

type TableScoreOrder = SorterResult<ScoreStudentDto> | SorterResult<ScoreStudentDto>[];

interface ScoreTableFiltersModified extends Omit<ScoreTableFilters, 'activeOnly'> {
  activeOnly?: boolean;
}
type StudentsState = {
  content: ScoreStudentDto[];
  pagination: IPaginationInfo;
  filter: ScoreTableFilters;
  order: ScoreOrder;
};

const courseTasksApi = new CoursesTasksApi();

export function ScoreTable(props: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { activeOnly, isVisibleSetting, setIsVisibleSettings } = props;
  const { ['mentor.githubId']: mentor, cityName, githubId, name } = router.query;

  const [columns, setColumns] = useState<ColumnType<ScoreStudentDto>[]>([]);
  const [fixedColumn, setFixedColumn] = useState<boolean>(true);
  const [courseTasks, setCourseTasks] = useState([] as CourseTaskDto[]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState(['']);
  const [students, setStudents] = useState<StudentsState>({
    content: [],
    pagination: { current: 1, pageSize: 100 },
    filter: { activeOnly: true },
    order: { field: 'rank', order: 'ascend' },
  });
  const [studentScore, setStudentScore] = useState<ScoreStudentDto | null>(null);

  const recentlyAppliedFilters = useRef<null | Record<string, FilterValue | null>>(null);

  const [notVisibleColumns = [], setNotVisibleColumns] = useLocalStorage<string[]>('notVisibleColumns');
  const courseService = useMemo(() => new CourseService(props.course.id), []);
  const [getPagedData] = useScorePaging(router, courseService, activeOnly);

  const getCourseScore = async (
    pagination: TablePaginationConfig,
    filters: ScoreTableFiltersModified,
    order: TableScoreOrder,
  ) => {
    if (!getPagedData) return;
    const data = await getPagedData(pagination as IPaginationInfo, filters as ScoreTableFilters, order as ScoreOrder);
    setStudents({ ...students, content: data.content, pagination: data.pagination });
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

      if (!isUndefined(githubId)) {
        filters = { ...filters, githubId } as ScoreTableFilters;
      }
      if (!isUndefined(name)) {
        filters = { ...filters, name } as ScoreTableFilters;
      }

      const [courseScore, studentCourseScore, courseTasks] = await Promise.all([
        courseService.getCourseScore(students.pagination, filters, students.order),
        courseService.getStudentCourseScore(props.session?.githubId as string),
        courseTasksApi.getCourseTasks(props.course.id),
      ]);

      const {
        content,
        pagination: { totalPages },
      } = courseScore;

      const {
        pagination: { current: currentPage },
      } = students;

      if (currentPage > totalPages) {
        const { content, pagination } = await courseService.getCourseScore(
          { ...students.pagination, current: totalPages },
          filters,
          students.order,
        );
        setStudents({ ...students, content, pagination: { ...pagination, current: totalPages } });
      } else {
        setStudents({ ...students, content, pagination: courseScore.pagination });
      }

      const sortedTasks = courseTasks.data
        .filter(task => !!task.studentEndDate || props.course.completed)
        .map(task => ({
          ...task,
          isVisible: !notVisibleColumns.includes(String(task.id)),
        }));
      setStudentScore(studentCourseScore);
      setCourseTasks(sortedTasks);
      setColumns(
        getColumns({
          githubId,
          name,
          cityName,
          mentor,
          taskColumns: getTaskColumns(sortedTasks),
        }),
      );

      setLoaded(true);
    } finally {
      props.onLoading(false);
    }
  }, [activeOnly]);

  const getVisibleColumns = (columns: ColumnType<ScoreStudentDto>[]) =>
    columns.filter(column => (column.dataIndex ? !notVisibleColumns.includes(String(column.dataIndex)) : true));

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

  const handleChange: TableProps<ScoreStudentDto>['onChange'] = async (pagination, filters, sorter, { action }) => {
    // Dirty hack to prevent sort request with old filters on Enter key in filter modal search input
    // This is known issue please, see https://github.com/ant-design/ant-design/issues/37334
    // TODO: Remove this hack after fix in antd
    if (action === 'filter') {
      recentlyAppliedFilters.current = filters;
      setTimeout(() => (recentlyAppliedFilters.current = null), 50);
    }
    if (action === 'sort' && recentlyAppliedFilters.current) {
      filters = recentlyAppliedFilters.current;
    }

    try {
      props.onLoading(true);
      const [studentCourseScore] = await Promise.all([
        courseService.getStudentCourseScore(props.session?.githubId as string),
        getCourseScore(pagination, filters, sorter),
      ]);
      setStudentScore(studentCourseScore);
    } finally {
      props.onLoading(false);
    }
  };

  const visibleColumns = getVisibleColumns(columns);
  const isSummaryShown = students.content.length > 0 && studentScore;

  return (
    <>
      <Table<ScoreStudentDto>
        className={styles.tableScore}
        showHeader
        scroll={{ x: getTableWidth(visibleColumns.length), y: 'calc(95vh - 320px)' }}
        pagination={{ ...students.pagination, showTotal: total => `Total ${total} students` }}
        rowKey="githubId"
        rowClassName={record => (!record.isActive ? 'rs-table-row-disabled' : '')}
        dataSource={students.content}
        summary={() =>
          isSummaryShown && (
            <Table.Summary fixed="top">
              <Summary studentScore={studentScore} visibleColumns={visibleColumns} />
            </Table.Summary>
          )
        }
        onChange={handleChange}
        columns={visibleColumns}
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
      <SettingsDrawer
        courseTasks={courseTasks}
        isVisible={isVisibleSetting}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </>
  );
}

export function getTableWidth(columnsCount: number) {
  const columnWidth = 90;
  // where 800 is approximate sum of basic columns (GitHub, Name, etc.)
  const tableWidth = columnsCount * columnWidth;
  return tableWidth;
}
