import { Table } from 'antd';
import { TeamDistributionStudentDto } from 'api';
import { StudentsTableColumnKey } from 'modules/Teams/constants';
import { useMemo } from 'react';
import { getColumns } from './renderers';

type Props = {
  content: TeamDistributionStudentDto[];
  teamLeadId?: number;
  notVisibleColumn?: StudentsTableColumnKey[];
};

export default function StudentsTable({ content, teamLeadId, notVisibleColumn = [] }: Props) {
  const columns = useMemo(
    () => getColumns(teamLeadId).filter(el => !notVisibleColumn.includes(el.key as StudentsTableColumnKey)),
    [notVisibleColumn, teamLeadId],
  );

  return (
    <Table<TeamDistributionStudentDto>
      showHeader
      dataSource={content}
      columns={columns}
      rowKey="id"
      pagination={false}
    />
  );
}
