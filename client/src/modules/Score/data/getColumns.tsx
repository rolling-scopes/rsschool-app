import { SettingFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import { CompareFn } from 'antd/lib/table/interface';
import { GithubAvatar } from 'components/GithubAvatar';
import { dateRenderer, getColumnSearchProps } from 'components/Table';
import { isArray } from 'lodash';
import Link from 'next/link';
import { ColumnTypeWithName, StudentScore, StudentScoreWithCrossCheckScore } from 'services/course';

const { Text } = Typography;

type Props = {
  taskColumns: ColumnTypeWithName<StudentScore>[];
  cityName?: string | string[];
  mentor?: string | string[];
  handleSettings: () => void;
};

type StringOrNumber = string | number;

const getSearchProps = (key: string) => ({
  ...getColumnSearchProps(key),
  onFilter: undefined,
});

const sort = <T,>(a: T, b: T): number => {
  if (a > b) {
    return 1;
  }

  if (a < b) {
    return -1;
  }

  return 0;
};

const sortByMentor = (a: StudentScore['mentor'], b: StudentScore['mentor']): number => {
  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  const itemA = 'githubId' in a ? a.githubId : a.id;
  const itemB = 'githubId' in b ? b.githubId : b.id;

  return sort(itemA, itemB);
};

function sorter(prop: keyof StudentScoreWithCrossCheckScore): CompareFn<StudentScoreWithCrossCheckScore> {
  const isPropADate = prop === 'totalScoreChangeDate' || prop === 'repositoryLastActivityDate';
  const isPropAMentor = prop === 'mentor';

  return (a: StudentScoreWithCrossCheckScore, b: StudentScoreWithCrossCheckScore) => {
    const itemA = a[prop];
    const itemB = b[prop];

    if (isPropADate) {
      return sort(new Date(itemA as string), new Date(itemB as string));
    }

    if (isPropAMentor) {
      return sortByMentor(itemA as StudentScore['mentor'], itemB as StudentScore['mentor']);
    }

    return sort(itemA as StringOrNumber, itemB as StringOrNumber);
  };
}

export function getColumns(props: Props): ColumnTypeWithName<StudentScoreWithCrossCheckScore>[] {
  const { cityName, mentor, handleSettings, taskColumns } = props;

  return [
    {
      title: '#',
      fixed: 'left',
      dataIndex: 'rank',
      key: 'rank',
      width: 50,
      sorter: sorter('rank'),
      render: (value: number) => (value >= 999999 ? 'New' : value),
    },
    {
      title: 'Github',
      fixed: 'left',
      key: 'githubId',
      dataIndex: 'githubId',
      sorter: sorter('githubId'),
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
      sorter: sorter('name'),
      render: (value, record) => (
        <Link prefetch={false} href={`/profile?githubId=${record.githubId}`}>
          <a>{value}</a>
        </Link>
      ),
      ...getSearchProps('name'),
    },
    {
      title: 'City',
      dataIndex: 'cityName',
      width: 150,
      sorter: sorter('cityName'),
      defaultFilteredValue: cityName ? (isArray(cityName) ? cityName : [cityName]) : undefined,
      ...getSearchProps('cityName'),
    },
    {
      title: 'Total',
      dataIndex: 'totalScore',
      width: 80,
      sorter: sorter('totalScore'),
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: 'Cross-Check',
      dataIndex: 'crossCheckScore',
      width: 90,
      sorter: sorter('crossCheckScore'),
      render: (value: number) => <Text strong>{value}</Text>,
    },
    ...taskColumns,
    {
      title: 'Change Date',
      dataIndex: 'totalScoreChangeDate',
      width: 80,
      sorter: sorter('totalScoreChangeDate'),
      render: dateRenderer,
    },
    {
      title: 'Last Commit Date',
      dataIndex: 'repositoryLastActivityDate',
      width: 80,
      sorter: sorter('repositoryLastActivityDate'),
      render: dateRenderer,
    },
    {
      title: 'Mentor',
      dataIndex: ['mentor', 'githubId'],
      width: 150,
      sorter: sorter('mentor'),
      defaultFilteredValue: mentor ? (isArray(mentor) ? mentor : [mentor]) : undefined,
      render: (value: string) => (
        <Link prefetch={false} href={`/profile?githubId=${value}`}>
          <a>{value}</a>
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
