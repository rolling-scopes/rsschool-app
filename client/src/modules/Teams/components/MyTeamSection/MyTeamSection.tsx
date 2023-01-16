import { Space, Typography } from 'antd';
import { EditTwoTone } from '@ant-design/icons';

import { TeamDistributionDetailedDto, TeamDto } from 'api';

const { Text, Title } = Typography;

type Props = {
  distribution: TeamDistributionDetailedDto;
  setTeamData: React.Dispatch<React.SetStateAction<Partial<TeamDto> | null>>;
  studentId?: number;
};

export default function MyTeamSection({ distribution, setTeamData, studentId }: Props) {
  const myTeam = distribution.myTeam!;
  return (
    <Space size={24} direction="vertical">
      <Title level={5}>{myTeam.name}</Title>
      <Space size={12}>
        <Text type="secondary">{myTeam.description}</Text>
        {studentId === myTeam.teamLeadId && <EditTwoTone twoToneColor="#1890FF" onClick={() => setTeamData(myTeam)} />}
      </Space>
    </Space>
  );
}
