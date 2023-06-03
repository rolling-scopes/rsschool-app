import { Col, Input, Row, Space, TablePaginationConfig, Typography } from 'antd';
import { useState } from 'react';

import { TeamDistributionApi, TeamDistributionDetailedDto, TeamDistributionStudentDto } from 'api';
import { useAsync } from 'react-use';
import StudentsTable from '../StudentsTable/StudentsTable';
import { IPaginationInfo } from 'common/types/pagination';
import { useLoading } from 'components/useLoading';

type Props = {
  distribution: TeamDistributionDetailedDto;
};

type StudentsState = {
  content: TeamDistributionStudentDto[];
  pagination: IPaginationInfo;
  search: string;
};

const { Title } = Typography;

const teamDistributionApi = new TeamDistributionApi();

export default function StudentsWithoutTeamSection({ distribution }: Props) {
  const [students, setStudents] = useState<StudentsState>({
    content: [],
    pagination: { current: 1, pageSize: 10 },
    search: '',
  });
  const [loading, withLoading] = useLoading(false);
  const [search, setSearch] = useState<string>('');

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const getStudents = withLoading(async (pagination: TablePaginationConfig) => {
    const { data } = await teamDistributionApi.getStudentsWithoutTeam(
      distribution.courseId,
      distribution.id,
      pagination.pageSize ?? 10,
      pagination.current ?? 1,
      search,
    );
    setStudents({ ...students, ...data });
  });

  useAsync(async () => await getStudents(students.pagination), [distribution, search]);

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
      <StudentsTable
        content={students.content}
        pagination={students.pagination}
        handleChange={getStudents}
        loading={loading}
      />
    </Space>
  );
}
