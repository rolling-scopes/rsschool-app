import { Col, Input, Row, Space, Table, TablePaginationConfig, TableProps, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { TeamApi, TeamDistributionDetailedDto, TeamDto } from 'api';
import { useAsync } from 'react-use';
import { IPaginationInfo } from 'common/types/pagination';
import { getColumns, expandedRowRender } from './renderers';
import { useLoading } from 'components/useLoading';
import { TeamsTableColumnKey } from 'modules/Teams/constants';

type Props = {
  distribution: TeamDistributionDetailedDto;
  toggleTeamModal: (data?: Partial<TeamDto> | undefined) => void;
  isManager: boolean;
};

type TeamsState = {
  content: TeamDto[];
  pagination: IPaginationInfo;
};

const { Title } = Typography;

const teamApi = new TeamApi();

export default function TeamSection({ distribution, toggleTeamModal, isManager }: Props) {
  const [teams, setTeams] = useState<TeamsState>({
    content: [],
    pagination: { current: 1, pageSize: 10 },
  });
  const [search, setSearch] = useState<string>('');

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const [loading, withLoading] = useLoading(false);

  const getTeams = withLoading(async (pagination: TablePaginationConfig) => {
    const { data } = await teamApi.getTeams(
      distribution.courseId,
      distribution.id,
      pagination.pageSize ?? 10,
      pagination.current ?? 1,
      search,
    );
    setTeams({ ...teams, ...data });
  });

  const columns = useMemo(() => {
    return isManager
      ? getColumns(distribution, toggleTeamModal)
      : getColumns(distribution, toggleTeamModal).filter(col => col.key !== TeamsTableColumnKey.Action);
  }, [isManager, distribution, toggleTeamModal]);

  const handleChange: TableProps<TeamDto>['onChange'] = pagination => {
    getTeams(pagination);
  };

  useAsync(async () => await getTeams(teams.pagination), [distribution, search]);

  return (
    <Space size={24} direction="vertical" style={{ width: '100%' }}>
      <Row justify="space-between">
        <Col span={8}>
          <Title level={5}>{`${distribution.name} teams`}</Title>
        </Col>
        <Col md={6} xl={4}>
          <Input.Search placeholder="input search text" allowClear onSearch={onSearch} />
        </Col>
      </Row>
      <Table<TeamDto>
        showHeader
        pagination={teams.pagination}
        rowKey="id"
        onChange={handleChange}
        dataSource={teams.content}
        columns={columns}
        expandable={{ expandedRowRender, rowExpandable: record => record.students.length > 0 }}
        loading={loading}
      />
    </Space>
  );
}
