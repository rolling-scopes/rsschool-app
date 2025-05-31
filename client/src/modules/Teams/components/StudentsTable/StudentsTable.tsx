import { Table, TablePaginationConfig, TableProps } from 'antd';
import { TeamDistributionStudentDto } from 'api';
import { StudentsTableColumnKey } from 'modules/Teams/constants';
import { useMemo } from 'react';
import { getColumns } from './renderers';

type Props = {
  content: TeamDistributionStudentDto[];
  teamLeadId?: number;
  notVisibleColumn?: StudentsTableColumnKey[];
  pagination: false | TablePaginationConfig;
  handleChange?: TableProps<TeamDistributionStudentDto>['onChange'];
  loading?: boolean;
  onDelete?: (student: TeamDistributionStudentDto) => void;
};

export default function StudentsTable({
  content,
  teamLeadId,
  notVisibleColumn = [],
  pagination,
  handleChange,
  loading,
  onDelete,
}: Props) {
  const columns = useMemo(
    () => getColumns(teamLeadId, onDelete).filter(el => !notVisibleColumn.includes(el.key as StudentsTableColumnKey)),
    [notVisibleColumn, teamLeadId, onDelete],
  );

  return (
    <Table<TeamDistributionStudentDto>
      showHeader
      dataSource={content}
      columns={columns}
      onChange={handleChange}
      rowKey="id"
      pagination={pagination}
      loading={loading}
    />
  );
}
