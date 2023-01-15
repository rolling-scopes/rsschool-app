import { Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TeamDistributionDetailedDto, TeamDistributionStudentDto, TeamDto } from 'api';
import { TeamsTableColumnKey, TeamsTableColumnName } from 'modules/Teams/constants';
import StudentsTable from '../StudentsTable/StudentsTable';

const { Text } = Typography;

function renderName(_v: string, { name }: TeamDto) {
  return <Text>{name}</Text>;
}

function renderDescription(_v: string, { description }: TeamDto) {
  return <Text type="secondary">{description}</Text>;
}

function renderMemberCount({ students }: TeamDto, membersCount: number) {
  return (
    <Text>
      {students.length} of {membersCount}
    </Text>
  );
}

export const getColumns = (distribution: TeamDistributionDetailedDto): ColumnsType<TeamDto> => [
  {
    key: TeamsTableColumnKey.Name,
    title: TeamsTableColumnName.Name,
    dataIndex: 'name',
    render: renderName,
  },
  {
    key: TeamsTableColumnKey.Description,
    title: TeamsTableColumnName.Description,
    dataIndex: 'description',
    width: 'auto',
    render: renderDescription,
  },
  {
    key: TeamsTableColumnKey.Members,
    title: TeamsTableColumnName.Members,
    dataIndex: 'solutionUrl',
    render: (_v, t) => renderMemberCount(t, distribution.studentsCount),
  },
];

export const expandedRowRender = (team: TeamDto) => {
  return (
    <StudentsTable content={team.students as unknown as TeamDistributionStudentDto[]} teamLeadId={team.teamLeadId} />
  );
};
