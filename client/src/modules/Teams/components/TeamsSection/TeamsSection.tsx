import { Space, Table, Typography } from 'antd';
import { useState } from 'react';

import { TeamApi, TeamDistributionDetailedDto, TeamDto } from 'api';
import { useAsync } from 'react-use';
import { IPaginationInfo } from 'common/types/pagination';
import { getColumns, expandedRowRender } from './renderers';

type Props = {
  distribution: TeamDistributionDetailedDto;
  courseId: number;
};

type TeamsState = {
  content: TeamDto[];
  pagination: IPaginationInfo;
};

const { Title } = Typography;

const teamApi = new TeamApi();

export default function TeamSection({ distribution, courseId }: Props) {
  const [teams, setTeams] = useState<TeamsState>({
    content: [],
    pagination: { current: 1, pageSize: 100 },
  });

  useAsync(async () => {
    const { data } = await teamApi.getTeams(courseId, distribution.id, '1', '10');
    setTeams({ ...teams, ...data });
  }, [distribution]);

  return (
    <Space size={24} direction="vertical" style={{ width: '100%' }}>
      <Title level={5}>{`${distribution.name} teams`}</Title>
      <Table<TeamDto>
        showHeader
        pagination={{ ...teams.pagination }}
        rowKey="id"
        dataSource={teams.content}
        columns={getColumns(distribution)}
        expandable={{ expandedRowRender, rowExpandable: record => record.students.length > 0 }}
      />
    </Space>
  );
}
