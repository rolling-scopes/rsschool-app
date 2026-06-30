import { Table, TablePaginationConfig, TableProps } from 'antd';
import { CourseDto, UserStudentDto } from '@client/api';
import { getColumns } from './renderers';

type Props = {
  content: UserStudentDto[];
  pagination: false | TablePaginationConfig;
  handleChange: TableProps<UserStudentDto>['onChange'];
  loading: boolean;
  courses: CourseDto[];
  setActiveStudent: (student: UserStudentDto | null) => void;
};

export default function StudentsTable({
  content,
  pagination,
  handleChange,
  loading,
  courses,
  setActiveStudent,
}: Props) {
  return (
    <Table<UserStudentDto>
      showHeader
      dataSource={content}
      size="small"
      columns={getColumns(courses)}
      onChange={handleChange}
      rowKey="id"
      pagination={pagination}
      onRow={record => {
        return {
          onClick: () => setActiveStudent(record),
        };
      }}
      loading={loading}
      bordered
      /**
       * `x: ''` keeps horizontal scrolling available without pinning the table to a fixed width.
       * Switching to a width value (e.g. `x: 'max-content'`) regresses sticky-header alignment on
       * antd's scrollable table — notably with an empty dataSource (see ant-design/ant-design#35284).
       * Re-verified on antd 6.3.1: the empty-string form is still required.
       */
      scroll={{ y: 'calc(100vh - 260px)', x: '' }}
    />
  );
}
