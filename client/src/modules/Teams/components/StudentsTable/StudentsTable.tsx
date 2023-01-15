import { Table } from 'antd';
import { TeamDistributionStudentDto } from 'api';
import { getColumns } from './renderers';

type Props = {
  content: TeamDistributionStudentDto[];
  teamLeadId?: number;
};

export default function StudentsTable({ content, teamLeadId }: Props) {
  return (
    <Table<TeamDistributionStudentDto>
      showHeader
      dataSource={content}
      columns={getColumns(teamLeadId)}
      rowKey="id"
      pagination={false}
    />
  );
}
