import { Table, TablePaginationConfig, TableProps } from 'antd';
import { MentorReviewDto } from 'api';
import { getColumns } from './renderers';

type Props = {
  content: MentorReviewDto[];
  pagination: false | TablePaginationConfig;
  handleChange?: TableProps<MentorReviewDto>['onChange'];
  loading?: boolean;
};

export default function MentorReviewsTable({ content, pagination, handleChange, loading }: Props) {
  return (
    <Table<MentorReviewDto>
      showHeader
      dataSource={content}
      size="small"
      columns={getColumns()}
      onChange={handleChange}
      rowKey="id"
      pagination={pagination}
      loading={loading}
    />
  );
}
