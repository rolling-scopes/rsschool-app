import { Button, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Breakpoint } from 'antd/lib';
import { TeamDistributionDetailedDto, TeamDto } from '@client/api';
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

function renderTeam(team: TeamDto, distribution: TeamDistributionDetailedDto) {
  return (
    <Space direction="vertical" size="small">
      {renderName('', team)}
      {renderDescription('', team)}
      {renderMemberCount(team, distribution.strictTeamSize)}
    </Space>
  );
}

const DISPLAY_TABLE_BREAKPOINTS: Breakpoint[] = ['sm'];
const DISPLAY_TABLE_MOBILE_BREAKPOINT: Breakpoint[] = ['xs'];

export const getColumns = (
  distribution: TeamDistributionDetailedDto,
  toggleTeamModal: (data?: Partial<TeamDto> | undefined) => void,
): ColumnsType<TeamDto> => [
  {
    key: TeamsTableColumnKey.Name,
    title: TeamsTableColumnName.Name,
    dataIndex: 'name',
    render: renderName,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: TeamsTableColumnKey.Description,
    title: TeamsTableColumnName.Description,
    dataIndex: 'description',
    width: 'auto',
    render: renderDescription,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: TeamsTableColumnKey.Members,
    title: TeamsTableColumnName.Members,
    dataIndex: 'students',
    render: (_v, t) => renderMemberCount(t, distribution.strictTeamSize),
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: TeamsTableColumnKey.Team,
    title: TeamsTableColumnName.Team,
    render: (_v, t) => renderTeam(t, distribution),
    responsive: DISPLAY_TABLE_MOBILE_BREAKPOINT,
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
