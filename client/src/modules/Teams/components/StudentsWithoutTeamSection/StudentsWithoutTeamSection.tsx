import { Space, Typography } from 'antd';
import { useState } from 'react';

import { TeamDistributionApi, TeamDistributionDetailedDto, TeamDistributionStudentDto, TeamDto } from 'api';
import { useAsync } from 'react-use';
import StudentsTable from '../StudentsTable/StudentsTable';

type Props = {
  distribution: TeamDistributionDetailedDto;
  courseId: number;
};

const { Title } = Typography;

const teamDistributionApi = new TeamDistributionApi();

export default function StudentsWithoutTeamSection({ distribution, courseId }: Props) {
  const [students, setStudents] = useState<TeamDistributionStudentDto[]>([]);

  useAsync(async () => {
    const { data } = await teamDistributionApi.getStudentsWithoutTeam(courseId, distribution.id);
    setStudents(data);
  }, []);

  return (
    <Space size={24} direction="vertical" style={{ width: '100%' }}>
      <Title level={5}>{`${distribution.name} teams`}</Title>
      <StudentsTable content={students} />
    </Space>
  );
}
