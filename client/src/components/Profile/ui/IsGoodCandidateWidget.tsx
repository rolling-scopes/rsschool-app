import { Tag, Typography } from 'antd';

const { Text } = Typography;

export function IsGoodCandidateWidget({ isGoodCandidate }: { isGoodCandidate: boolean | null }) {
  if (isGoodCandidate === null) {
    return null;
  }

  return (
    <Text>
      <Text style={{ fontWeight: 'bold' }}>Good candidate:</Text>{' '}
      {isGoodCandidate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
    </Text>
  );
}
