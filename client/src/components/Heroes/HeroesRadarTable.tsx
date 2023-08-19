import { Table, TableProps } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { HeroRadarDto, HeroesRadarBadgeDto, HeroesRadarDto } from 'api';
import { GithubAvatar } from 'components/GithubAvatar';
import Link from 'next/link';
import HeroesCountBadge from './HeroesCountBadge';
import useWindowDimensions from 'utils/useWindowDimensions';
import { useState, useEffect } from 'react';
import { GetHeroesPros, HeroesRadarFormProps, LayoutType } from 'pages/heroes/radar';
import { getTableWidth } from 'modules/Score/components/ScoreTable';
import heroesBadges from 'configs/heroes-badges';

interface HeroRadarRanked extends HeroRadarDto {
  rank: number;
}

interface HeroesRadarTableProps {
  heroes: HeroesRadarDto;
  formData: HeroesRadarFormProps;
  setLoading: (loading: boolean) => void;
  getHeroes: (args: GetHeroesPros) => Promise<void>;
  setFormLayout: (layout: LayoutType) => void;
}

const BADGE_SIZE = 48;
const BADGE_SUM_HORIZONTAL_MARGIN = 2 * 5;
const XS_BREAKPOINT_IN_PX = 575;

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
    width: Object.keys(heroesBadges).length * (BADGE_SIZE + BADGE_SUM_HORIZONTAL_MARGIN),
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

function HeroesRadarTable({ heroes, formData, setLoading, getHeroes, setFormLayout }: HeroesRadarTableProps) {
  const { width } = useWindowDimensions();
  const [fixedColumn, setFixedColumn] = useState<boolean>(true);
  const [columns, setColumns] = useState(initColumns);

  useEffect(() => {
    if (width < XS_BREAKPOINT_IN_PX) {
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

  const handleChange: TableProps<HeroRadarRanked>['onChange'] = async ({ current, pageSize }) => {
    try {
      setLoading(true);
      await getHeroes({ current, pageSize, ...formData });
    } finally {
      setLoading(false);
    }
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
