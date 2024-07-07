import { Table, TablePaginationConfig, TableProps } from 'antd';
import { CourseDto, UserStudentDto } from 'api';
import { getColumns } from './renderers';

type Props = {
  content: UserStudentDto[];
  pagination: false | TablePaginationConfig;
  handleChange: TableProps<UserStudentDto>['onChange'];
  loading: boolean;
  courses: CourseDto[];
};

export default function StudentsTable({ content, pagination, handleChange, loading, courses }: Props) {
  return (
    <Table<UserStudentDto>
      showHeader
      dataSource={content}
      size="small"
      columns={getColumns(courses)}
      onChange={handleChange}
      rowKey="id"
      pagination={pagination}
      loading={loading}
      bordered
      /**
       * @see
       * dirty-hack to fix x-scroll in antd table
       */
      scroll={{ y: 'calc(100vh - 260px)', x: '' }}
    />
  );
}
