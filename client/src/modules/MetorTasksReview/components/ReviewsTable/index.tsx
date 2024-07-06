import { Table, TablePaginationConfig, TableProps } from 'antd';
import { CourseTaskDto, MentorReviewDto } from 'api';
import { getColumns } from './renderers';

type Props = {
  content: MentorReviewDto[];
  pagination: false | TablePaginationConfig;
  handleChange?: TableProps<MentorReviewDto>['onChange'];
  loading?: boolean;
  tasks: CourseTaskDto[];
};

export default function MentorReviewsTable({ content, pagination, handleChange, loading, tasks }: Props) {
  return (
    <Table<MentorReviewDto>
      showHeader
      dataSource={content}
      size="small"
      columns={getColumns(tasks)}
      onChange={handleChange}
      rowKey="id"
      pagination={pagination}
      loading={loading}
    />
  );
}
