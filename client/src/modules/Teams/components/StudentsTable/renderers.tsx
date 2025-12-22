import { Space, Tag, Typography, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TeamDistributionStudentDto } from '@client/api';
import { StudentsTableColumnKey, StudentsTableColumnName } from 'modules/Teams/constants';
import { TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { Breakpoint } from 'antd/lib';
import { StudentDiscord } from 'components/StudentDiscord';
const { Text, Link } = Typography;

function renderName({ fullName, cvUuid, id }: TeamDistributionStudentDto, teamLeadId?: number) {
  return cvUuid ? (
    <Link target="_blank" href={`${window.location.origin}/cv/${cvUuid}`}>
      <Space size="small">
        {fullName}
        {id === teamLeadId && (
          <Tag color="blue">
            <TeamOutlined color="white" />
          </Tag>
        )}
      </Space>
    </Link>
  ) : (
    <Space size="small">
      {fullName}
      {id === teamLeadId && (
        <Tag color="blue">
          <TeamOutlined color="white" />
        </Tag>
      )}
    </Space>
  );
}

function renderGithub(_v: string, { githubId }: TeamDistributionStudentDto) {
  return (
    <Link target="_blank" href={`https://github.com/${githubId}`}>
      {githubId}
    </Link>
  );
}

function renderPosition(_v: string, { rank }: TeamDistributionStudentDto) {
  return <Text>{rank}</Text>;
}

function renderLocation(_v: string, { location }: TeamDistributionStudentDto) {
  return <Text>{location}</Text>;
}

function renderEmail(_v: string, { email }: TeamDistributionStudentDto) {
  return <Text>{email}</Text>;
}

function renderDiscord(_v: string, { discord }: TeamDistributionStudentDto) {
  return <StudentDiscord discord={discord} />;
}

function renderStudent(_v: string, student: TeamDistributionStudentDto) {
  return (
    <Space direction="vertical" size="small">
      {renderName(student)}
      {renderLocation('', student)}
      <Text>rank: {renderPosition('', student)}</Text>
    </Space>
  );
}

function renderContacts(_v: string, student: TeamDistributionStudentDto) {
  return (
    <Space direction="vertical" size="small">
      {renderDiscord('', student)}
      {renderEmail('', student)}
    </Space>
  );
}

function renderDeleteAction(
  student: TeamDistributionStudentDto,
  onDelete?: (student: TeamDistributionStudentDto) => void,
) {
  if (!onDelete) return null;
  return <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(student)} />;
}

const DISPLAY_TABLE_BREAKPOINTS: Breakpoint[] = ['md'];
const DISPLAY_TABLE_MOBILE_BREAKPOINT: Breakpoint[] = ['xs'];

export const getColumns = (
  teamLeadId?: number,
  onDelete?: (student: TeamDistributionStudentDto) => void,
): ColumnsType<TeamDistributionStudentDto> => [
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnName.Name,
    dataIndex: 'name',
    width: '20%',
    render: (_v, t) => renderName(t, teamLeadId),
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.Position,
    title: StudentsTableColumnName.Position,
    dataIndex: 'rank',
    align: 'right',
    width: '10%',
    render: renderPosition,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.Email,
    title: StudentsTableColumnName.Email,
    dataIndex: 'email',
    width: '10%',
    render: renderEmail,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.Discord,
    title: StudentsTableColumnName.Discord,
    dataIndex: 'discord',
    width: '10%',
    render: renderDiscord,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.GitHub,
    title: StudentsTableColumnName.GitHub,
    dataIndex: 'github',
    width: '10%',
    render: renderGithub,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.Location,
    title: StudentsTableColumnName.Location,
    dataIndex: 'location',
    width: '20%',
    render: renderLocation,
    responsive: DISPLAY_TABLE_BREAKPOINTS,
  },
  {
    key: StudentsTableColumnKey.Student,
    title: StudentsTableColumnName.Student,
    width: '50%',
    render: renderStudent,
    responsive: DISPLAY_TABLE_MOBILE_BREAKPOINT,
  },
  {
    key: StudentsTableColumnKey.Contacts,
    title: StudentsTableColumnName.Contacts,
    width: '50%',
    render: renderContacts,
    responsive: DISPLAY_TABLE_MOBILE_BREAKPOINT,
  },
  ...(onDelete
    ? [
        {
          key: StudentsTableColumnKey.Action,
          title: StudentsTableColumnName.Action,
          width: '10%',
          render: (_v: string, student: TeamDistributionStudentDto) => renderDeleteAction(student, onDelete),
          responsive: DISPLAY_TABLE_BREAKPOINTS,
        },
      ]
    : []),
];
