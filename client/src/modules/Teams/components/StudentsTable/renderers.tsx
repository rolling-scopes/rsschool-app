import { Space, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TeamDistributionStudentDto } from 'api';
import { StudentsTableColumnKey, StudentsTableColumnName } from 'modules/Teams/constants';
import { TeamOutlined } from '@ant-design/icons';
const { Text, Link } = Typography;

function renderName({ fullName, cvLink, id }: TeamDistributionStudentDto, teamLeadId?: number) {
  return (
    <Link target="_blank" href={cvLink}>
      <Space size="small">
        {fullName}
        {id === teamLeadId && <TeamOutlined twoToneColor="#40A9FF" />}
      </Space>
    </Link>
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
  return <Text>{discord}</Text>;
}

export const getColumns = (teamLeadId?: number): ColumnsType<TeamDistributionStudentDto> => [
  {
    key: StudentsTableColumnKey.Name,
    title: StudentsTableColumnName.Name,
    dataIndex: 'name',
    render: (_v, t) => renderName(t, teamLeadId),
  },
  {
    key: StudentsTableColumnKey.Position,
    title: StudentsTableColumnName.Position,
    dataIndex: 'rank',
    align: 'right',
    render: renderPosition,
  },
  {
    key: StudentsTableColumnKey.Email,
    title: StudentsTableColumnName.Email,
    dataIndex: 'email',
    render: renderEmail,
  },
  {
    key: StudentsTableColumnKey.Discord,
    title: StudentsTableColumnName.Discord,
    dataIndex: 'discord',
    render: renderDiscord,
  },
  {
    key: StudentsTableColumnKey.Github,
    title: StudentsTableColumnName.Github,
    dataIndex: 'github',
    render: renderGithub,
  },
  {
    key: StudentsTableColumnKey.Location,
    title: StudentsTableColumnName.Location,
    dataIndex: 'location',
    render: renderLocation,
  },
];
