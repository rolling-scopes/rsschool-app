import { Table, TableProps, Tag } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { HeroRadarDto, HeroesRadarBadgeDto, HeroesRadarDto } from 'api';
import { GithubAvatar } from 'components/GithubAvatar';
import Link from 'next/link';
import HeroesCountBadge from './HeroesCountBadge';
import useWindowDimensions from 'utils/useWindowDimensions';
import { useState, useEffect } from 'react';
import type { LayoutType } from './HeroesRadarTab';
import { getTableWidth } from 'modules/Score/components/ScoreTable';
import heroesBadges from 'configs/heroes-badges';

interface HeroesRadarTableProps {
  heroes: HeroesRadarDto;
  onChange: TableProps<HeroRadarDto>['onChange'];
  setFormLayout: (layout: LayoutType) => void;
}

const BADGE_SIZE = 48;
const BADGE_SUM_HORIZONTAL_MARGIN = 2 * 5;
const XS_BREAKPOINT_IN_PX = 575;

const initColumns: ColumnType<HeroRadarDto>[] = [
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
    render: (value: HeroesRadarBadgeDto[], { total }: HeroRadarDto) => (
      <>
        {value.map(({ id, badgeId, comment, date }) => {
          return <HeroesCountBadge key={id} badge={{ badgeId, comment, date }} />;
        })}

        {total > 20 && <Tag>+{total - 20} More</Tag>}
      </>
    ),
  },
];

function HeroesRadarTable({ heroes, onChange, setFormLayout }: HeroesRadarTableProps) {
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

  return (
    <Table
      pagination={{ ...heroes.pagination, showTotal: total => `Total ${total} students` }}
      onChange={onChange}
      rowKey="githubId"
      scroll={{ x: getTableWidth(columns.length), y: 'calc(95vh - 290px)' }}
      dataSource={heroes.content}
      columns={columns}
    />
  );
}

export default HeroesRadarTable;
