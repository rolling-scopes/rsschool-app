import { Space, TablePaginationConfig, TableProps, Typography } from 'antd';
import { useState } from 'react';

import { TeamDistributionApi, TeamDistributionDetailedDto, TeamDistributionStudentDto } from 'api';
import { useAsync } from 'react-use';
import StudentsTable from '../StudentsTable/StudentsTable';
import { IPaginationInfo } from 'common/types/pagination';

type Props = {
  distribution: TeamDistributionDetailedDto;
};

type StudentsState = {
  content: TeamDistributionStudentDto[];
  pagination: IPaginationInfo;
};

const { Title } = Typography;

const teamDistributionApi = new TeamDistributionApi();

export default function StudentsWithoutTeamSection({ distribution }: Props) {
  const [students, setStudents] = useState<StudentsState>({
    content: [],
    pagination: { current: 1, pageSize: 10 },
  });

  const getStudents = async (pagination: TablePaginationConfig) => {
    const { data } = await teamDistributionApi.getStudentsWithoutTeam(
      distribution.courseId,
      distribution.id,
      String(pagination.current),
      String(pagination.pageSize),
    );
    setStudents({ ...students, ...data });
  };

  const handleChange: TableProps<TeamDistributionStudentDto>['onChange'] = pagination => {
    getStudents(pagination);
  };

  useAsync(async () => await getStudents(students.pagination), [distribution]);

  return (
    <Space size={24} direction="vertical" style={{ width: '100%' }}>
      <Title level={5}>{`${distribution.name} teams`}</Title>
      <StudentsTable content={students.content} pagination={students.pagination} handleChange={handleChange} />
    </Space>
  );
}
