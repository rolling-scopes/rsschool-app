import { Space, Table, TablePaginationConfig, TableProps, Typography } from 'antd';
import { useState } from 'react';

import { TeamApi, TeamDistributionDetailedDto, TeamDto } from 'api';
import { useAsync } from 'react-use';
import { IPaginationInfo } from 'common/types/pagination';
import { getColumns, expandedRowRender } from './renderers';

type Props = {
  distribution: TeamDistributionDetailedDto;
};

type TeamsState = {
  content: TeamDto[];
  pagination: IPaginationInfo;
};

const { Title } = Typography;

const teamApi = new TeamApi();

export default function TeamSection({ distribution }: Props) {
  const [teams, setTeams] = useState<TeamsState>({
    content: [],
    pagination: { current: 1, pageSize: 10 },
  });

  const getTeams = async (pagination: TablePaginationConfig) => {
    const { data } = await teamApi.getTeams(
      distribution.courseId,
      distribution.id,
      String(pagination.current),
      String(pagination.pageSize),
    );
    setTeams({ ...teams, ...data });
  };

  const handleChange: TableProps<TeamDto>['onChange'] = pagination => {
    getTeams(pagination);
  };

  useAsync(async () => await getTeams(teams.pagination), [distribution]);

  return (
    <Space size={24} direction="vertical" style={{ width: '100%' }}>
      <Title level={5}>{`${distribution.name} teams`}</Title>
      <Table<TeamDto>
        showHeader
        pagination={teams.pagination}
        rowKey="id"
        onChange={handleChange}
        dataSource={teams.content}
        columns={getColumns(distribution)}
        expandable={{ expandedRowRender, rowExpandable: record => record.students.length > 0 }}
      />
    </Space>
  );
}
