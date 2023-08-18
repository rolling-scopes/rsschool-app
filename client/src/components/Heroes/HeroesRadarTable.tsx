import { Table, TablePaginationConfig, TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { HeroRadarDto, HeroesRadarBadgeDto, HeroesRadarDto } from 'api';
import { GithubAvatar } from 'components/GithubAvatar';
import Link from 'next/link';
import HeroesCountBadge from './HeroesCountBadge';
import { IPaginationInfo } from 'common/types/pagination';
import useWindowDimensions from 'utils/useWindowDimensions';
import { useState, useEffect } from 'react';
import { LayoutType } from 'pages/heroes/radar';
import { getTableWidth } from 'modules/Score/components/ScoreTable';

interface HeroRadarRanked extends HeroRadarDto {
  rank: number;
}

interface HeroesRadarTableProps {
  heroes: HeroesRadarDto;
  courseId: number | undefined;
  setLoading: (loading: boolean) => void;
  getHeroes: (args: { courseId?: number } & Partial<IPaginationInfo>) => Promise<void>;
  setFormLayout: (layout: LayoutType) => void;
}

const initColumns: ColumnType<HeroRadarRanked>[] = [
  {
    title: '#',
    fixed: 'left',
    dataIndex: 'rank',
    key: 'rank',
    width: 50,
    defaultSortOrder: 'ascend',
    sorter: (a, b) => a.rank - b.rank,
    render: (value: number) => (value >= 999999 ? 'New' : value),
  },
  {
    title: 'Github',
    fixed: 'left',
    key: 'githubId',
    dataIndex: 'githubId',
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
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (value: string, record: HeroRadarDto) => (
      <Link prefetch={false} href={`/profile?githubId=${record.githubId}`}>
        {value}
      </Link>
    ),
  },
  {
    title: 'Total badges count',
    dataIndex: 'total',
    key: 'total',
    width: 80,
    render: (value: number) => <b>{value}</b>,
  },
  {
    title: 'Badges',
    dataIndex: 'badges',
    key: 'badges',
    responsive: ['xxl', 'xl', 'lg', 'md', 'sm'],
    render: (value: HeroesRadarBadgeDto[], { githubId }: HeroRadarRanked) => (
      <>
        {value.map(badge => (
          <HeroesCountBadge key={`${githubId}-${badge.badgeId}`} badge={badge} />
        ))}
      </>
    ),
  },
];

function HeroesRadarTable({ heroes, courseId, setLoading, getHeroes, setFormLayout }: HeroesRadarTableProps) {
  const { width } = useWindowDimensions();
  const [fixedColumn, setFixedColumn] = useState<boolean>(true);
  const [columns, setColumns] = useState(initColumns);

  useEffect(() => {
    if (width < 400) {
      setFixedColumn(false);
      setFormLayout('vertical');
      return;
    }

    setFixedColumn(true);
    setFormLayout('inline');
  }, [width]);

  useEffect(() => {
    setColumns(prevColumns => {
      const githubColumn = prevColumns.find(el => el.key === 'githubId');
      if (githubColumn) {
        githubColumn.fixed = fixedColumn ? 'left' : false;
      }

      return prevColumns;
    });
  }, [fixedColumn]);

  const dataSource = heroes?.content?.length
    ? heroes.content.map((hero: HeroRadarDto, i) => {
        const rank = i + 1 + heroes.pagination.pageSize * (heroes.pagination.current - 1);
        const name = !hero.firstName && !hero.lastName ? '(Empty)' : `${hero.firstName} ${hero.lastName}`;

        return { ...hero, rank, name };
      })
    : [];

  const getPagedData = async (pagination: TablePaginationConfig) => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      await getHeroes({ current, pageSize, courseId });
    } finally {
      setLoading(false);
    }
  };

  const handleChange: TableProps<HeroRadarRanked>['onChange'] = pagination => {
    getPagedData(pagination);
  };

  return (
    <Table
      pagination={{ ...heroes.pagination, showTotal: total => `Total ${total} students` }}
      onChange={handleChange}
      rowKey="githubId"
      scroll={{ x: getTableWidth(columns.length), y: 'calc(95vh - 290px)' }}
      dataSource={dataSource}
      columns={columns}
    />
  );
}

export default HeroesRadarTable;
