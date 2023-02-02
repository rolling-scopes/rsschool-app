import { Button, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TeamDistributionDetailedDto, TeamDto } from 'api';
import { StudentsTableColumnKey, TeamsTableColumnKey, TeamsTableColumnName } from 'modules/Teams/constants';
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

function renderAction(onEditTeam: () => void) {
  return (
    <Button
      type="link"
      onClick={() => {
        onEditTeam();
      }}
    >
      Edit team
    </Button>
  );
}

export const getColumns = (
  distribution: TeamDistributionDetailedDto,
  toggleTeamModal: (data?: Partial<TeamDto> | undefined) => void,
): ColumnsType<TeamDto> => [
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
    dataIndex: 'students',
    render: (_v, t) => renderMemberCount(t, distribution.strictTeamSize),
  },
  {
    key: TeamsTableColumnKey.Action,
    title: TeamsTableColumnName.Action,
    render: (_v, t) => renderAction(() => toggleTeamModal(t)),
  },
];

export const expandedRowRender = (team: TeamDto) => {
  return (
    <StudentsTable
      content={team.students}
      teamLeadId={team.teamLeadId}
      notVisibleColumn={[StudentsTableColumnKey.Email]}
      pagination={false}
    />
  );
};
