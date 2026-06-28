import { Tag, Typography } from 'antd';

const { Text } = Typography;

export function IsGoodCandidateWidget({ isGoodCandidate }: { isGoodCandidate: boolean | null }) {
  if (!isGoodCandidate) {
    return null;
  }

  return (
    <Text>
      <Text style={{ fontWeight: 'bold' }}>Good candidate:</Text> <Tag color="green">Yes</Tag>
    </Text>
  );
}
