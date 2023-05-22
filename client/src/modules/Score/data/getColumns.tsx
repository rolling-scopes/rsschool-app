import { ColumnType } from 'antd/lib/table';
import SettingFilled from '@ant-design/icons/SettingFilled';
import { Typography } from 'antd';
import { ScoreStudentDto } from 'api';
import { GithubAvatar } from 'components/GithubAvatar';
import { dateRenderer, getColumnSearchProps } from 'components/Table';
import isArray from 'lodash/isArray';
import Link from 'next/link';

const { Text } = Typography;

type Props = {
  taskColumns: Record<string, any>[];
  cityName?: string | string[];
  mentor?: string | string[];
  handleSettings: () => void;
};

const getSearchProps = (key: string) => ({
  ...getColumnSearchProps(key),
  onFilter: undefined,
});

export function getColumns(props: Props): ColumnType<ScoreStudentDto>[] {
  const { cityName, mentor, handleSettings, taskColumns } = props;

  return [
    {
      title: '#',
      fixed: 'left',
      dataIndex: 'rank',
      key: 'rank',
      width: 50,
      sorter: 'rank',
      render: (value: number) => (value >= 999999 ? 'New' : value),
    },
    {
      title: 'Github',
      fixed: 'left',
      key: 'githubId',
      dataIndex: 'githubId',
      sorter: 'githubId',
      width: 150,
      render: (value: string) => (
        <div>
          <GithubAvatar githubId={value} size={24} />
          &nbsp;
          <a target="_blank" href={`https://github.com/${value}`}>
            {value}
          </a>
        </div>
      ),
      ...getSearchProps('githubId'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 150,
      sorter: 'name',
      render: (value, record) => (
        <Link prefetch={false} href={`/profile?githubId=${record.githubId}`}>
          {value}
        </Link>
      ),
      ...getSearchProps('name'),
    },
    {
      title: 'City',
      dataIndex: 'cityName',
      width: 150,
      sorter: 'cityName',
      defaultFilteredValue: cityName ? (isArray(cityName) ? cityName : [cityName]) : undefined,
      ...getSearchProps('cityName'),
    },
    {
      title: 'Total',
      dataIndex: 'totalScore',
      width: 80,
      sorter: 'totalScore',
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: 'Cross-Check',
      dataIndex: 'crossCheckScore',
      width: 90,
      sorter: 'crossCheckScore',
      render: (value: number) => <Text strong>{value}</Text>,
    },
    ...taskColumns,
    {
      title: 'Change Date',
      dataIndex: 'totalScoreChangeDate',
      width: 80,
      sorter: 'totalScoreChangeDate',
      render: dateRenderer,
    },
    {
      title: 'Last Commit Date',
      dataIndex: 'repositoryLastActivityDate',
      width: 80,
      sorter: 'repositoryLastActivityDate',
      render: dateRenderer,
    },
    {
      title: 'Mentor',
      dataIndex: ['mentor', 'githubId'],
      width: 150,
      sorter: 'mentor',
      defaultFilteredValue: mentor ? (isArray(mentor) ? mentor : [mentor]) : undefined,
      render: (value: string) => (
        <Link prefetch={false} href={`/profile?githubId=${value}`}>
          {value}
        </Link>
      ),
      ...getSearchProps('mentor.githubId'),
    },
    {
      title: () => <SettingFilled onClick={handleSettings} />,
      fixed: 'right',
      width: 30,
      align: 'center',
      render: () => '',
    },
  ];
}
