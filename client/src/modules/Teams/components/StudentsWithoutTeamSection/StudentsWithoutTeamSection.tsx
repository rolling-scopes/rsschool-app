import { Col, Input, Row, Space, TablePaginationConfig, Typography, Modal } from 'antd';
import { useState } from 'react';

import { TeamDistributionApi, TeamDistributionDetailedDto, TeamDistributionStudentDto } from 'api';
import { useAsync } from 'react-use';
import StudentsTable from '../StudentsTable/StudentsTable';
import { IPaginationInfo } from '@common/types/pagination';
import { useLoading } from 'components/useLoading';
import { useMessage } from 'hooks';

type Props = {
  distribution: TeamDistributionDetailedDto;
  isManager: boolean;
  reloadDistribution: () => Promise<TeamDistributionDetailedDto | undefined>;
};

type StudentsState = {
  content: TeamDistributionStudentDto[];
  pagination: IPaginationInfo;
  search: string;
};

const { Title } = Typography;
const { confirm } = Modal;

const teamDistributionApi = new TeamDistributionApi();

export default function StudentsWithoutTeamSection({ distribution, isManager, reloadDistribution }: Props) {
  const { message } = useMessage();
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

  const handleDeleteStudent = async (student: TeamDistributionStudentDto) => {
    confirm({
      title: 'Are you sure you want to remove this student?',
      content: `This will remove ${student.fullName} from the team distribution.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await teamDistributionApi.teamDistributionControllerDeleteStudentFromDistribution(
            student.id,
            distribution.courseId,
            distribution.id,
          );
          message.success('Student removed successfully');
          await getStudents(students.pagination);
          await reloadDistribution();
        } catch {
          message.error('Failed to remove student. Please try again later.');
        }
      },
    });
  };

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
        onDelete={isManager ? handleDeleteStudent : undefined}
      />
    </Space>
  );
}
